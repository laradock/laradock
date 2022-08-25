vcl 4.1;
# Based on: https://github.com/mattiasgeniar/varnish-6.0-configuration-templates/blob/master/default.vcl

import std;
import directors;

backend everpracticalsolutionsServer { # Define one backend
    .host = "${BACKEND_HOST}"; # IP or Hostname of backend
    .port = "${BACKEND_PORT}"; # Port Apache or whatever is listening
    .max_connections = 300; # That's it

    .probe = {
        #.url = "/"; # short easy way (GET /)
        # We prefer to only do a HEAD /
        .request =
            "HEAD /health_check.php HTTP/1.1"
            "Host: ${BACKEND_HOST}"
            "Connection: close"
            "User-Agent: Varnish Health Probe";

        .interval  = 5s; # check the health of each backend every 5 seconds
        .timeout   = 1s; # timing out after 1 second.
        .window    = 5;  # If 3 out of the last 5 polls succeeded the backend is considered healthy, otherwise it will be marked as sick
        .threshold = 3;
    }

    .first_byte_timeout     = 300s;   # How long to wait before we receive a first byte from our backend?
    .connect_timeout        = 5s;     # How long to wait for a backend connection?
    .between_bytes_timeout  = 2s;     # How long to wait between bytes received from our backend?
}

# Only allow purging from specific IPs
acl purge {
    "localhost";
    "127.0.0.1";
    "192.168.16.5";
    "192.168.16.6";
    "185.228.234.203";
}

# This function is used when a request is send by a HTTP client (Browser)
sub vcl_recv {
    # Normalize the header, remove the port (in case you're testing this on various TCP ports)
    set req.http.Host = regsub(req.http.Host, ":[0-9]+", "");

    # Allow purging from ACL
    if (req.method == "PURGE") {
        # If not allowed then a error 405 is returned
        if (!client.ip ~ purge) {
                return(synth(405, "This IP is not allowed to send PURGE requests."));
        }

        ban("req.http.host == " + req.http.host);
        # Throw a synthetic page so the request won't go to the backend.
        return(synth(200, "Ban added"));
        # If allowed, do a cache_lookup -> vlc_hit() or vlc_miss()
        #return (purge);
    }

    # Post requests will not be cached
    if (req.http.Authorization || req.method == "POST") {
        return (pass);
    }

    # --- WordPress specific configuration

    # Did not cache the RSS feed
    if (req.url ~ "/feed") {
        return (pass);
    }

    # Blitz hack
    if (req.url ~ "/mu-.*") {
        return (pass);
    }

    # Did not cache the admin and login pages
    if (req.url ~ "/wp-(login|admin)") {
        return (pass);
    }

    # Remove the "has_js" cookie
    set req.http.Cookie = regsuball(req.http.Cookie, "has_js=[^;]+(; )?", "");

    # Remove any Google Analytics based cookies
    set req.http.Cookie = regsuball(req.http.Cookie, "__utm.=[^;]+(; )?", "");

    # Remove the Quant Capital cookies (added by some plugin, all __qca)
    set req.http.Cookie = regsuball(req.http.Cookie, "__qc.=[^;]+(; )?", "");

    # Remove the wp-settings-1 cookie
    set req.http.Cookie = regsuball(req.http.Cookie, "wp-settings-1=[^;]+(; )?", "");

    # Remove the wp-settings-time-1 cookie
    set req.http.Cookie = regsuball(req.http.Cookie, "wp-settings-time-1=[^;]+(; )?", "");

    # Remove the wp test cookie
    set req.http.Cookie = regsuball(req.http.Cookie, "wordpress_test_cookie=[^;]+(; )?", "");

    # Are there cookies left with only spaces or that are empty?
    if (req.http.cookie ~ "^ *$") {
        unset req.http.cookie;
    }

    # Cache the following files extensions
    if (req.url ~ "\.(css|js|png|gif|jp(e)?g|swf|ico)") {
        unset req.http.cookie;
    }

    # Normalize Accept-Encoding header and compression
    # https://www.varnish-cache.org/docs/3.0/tutorial/vary.html
    if (req.http.Accept-Encoding) {
        # Do no compress compressed files...
        if (req.url ~ "\.(jpg|png|gif|gz|tgz|bz2|tbz|mp3|ogg)$") {
            unset req.http.Accept-Encoding;
        } elsif (req.http.Accept-Encoding ~ "gzip") {
            set req.http.Accept-Encoding = "gzip";
        } elsif (req.http.Accept-Encoding ~ "deflate") {
            set req.http.Accept-Encoding = "deflate";
        } else {
            unset req.http.Accept-Encoding;
        }
    }

    # Check the cookies for wordpress-specific items
    if (req.http.Cookie ~ "wordpress_" || req.http.Cookie ~ "comment_") {
        return (pass);
    }
    if (!req.http.cookie) {
        unset req.http.cookie;
    }

    # --- End of WordPress specific configuration

    # Do not cache HTTP authentication and HTTP Cookie
    if (req.http.Authorization || req.http.Cookie) {
        # Not cacheable by default
        return (pass);
    }

    # Cache all others requests
    return (hash);
}

sub vcl_pipe {
    return (pipe);
}

sub vcl_pass {
    return (fetch);
}

# The data on which the hashing will take place
sub vcl_hash {
    hash_data(req.url);
    if (req.http.host) {
         hash_data(req.http.host);
    } else {
         hash_data(server.ip);
    }

    # If the client supports compression, keep that in a different cache
    if (req.http.Accept-Encoding) {
         hash_data(req.http.Accept-Encoding);
    }

    return (lookup);
}

# This function is used when a request is sent by our backend (Nginx server)
sub vcl_backend_response {
    # Remove some headers we never want to see
    unset beresp.http.Server;
    unset beresp.http.X-Powered-By;

    # For static content strip all backend cookies
    if (bereq.url ~ "\.(css|js|png|gif|jp(e?)g)|swf|ico") {
        unset beresp.http.cookie;
    }

    # Only allow cookies to be set if we're in admin area
    if (beresp.http.Set-Cookie && bereq.url !~ "^/wp-(login|admin)") {
        unset beresp.http.Set-Cookie;
    }

    # don't cache response to posted requests or those with basic auth
    if ( bereq.method == "POST" || bereq.http.Authorization ) {
        set beresp.uncacheable = true;
        set beresp.ttl = 120s;
        return (deliver);
    }

    # don't cache search results
    if ( bereq.url ~ "\?s=" ){
        set beresp.uncacheable = true;
        set beresp.ttl = 120s;
        return (deliver);
    }

    # only cache status ok
    if ( beresp.status != 200 ) {
        set beresp.uncacheable = true;
        set beresp.ttl = 120s;
        return (deliver);
    }

    # A TTL of 24h
    set beresp.ttl = 24h;
    # Define the default grace period to serve cached content
    set beresp.grace = 30s;

    return (deliver);
}

# The routine when we deliver the HTTP request to the user
# Last chance to modify headers that are sent to the client
sub vcl_deliver {
    if (obj.hits > 0) {
        set resp.http.X-Cache = "cached";
    } else {
        set resp.http.x-Cache = "uncached";
    }

    # Remove some headers: PHP version
    unset resp.http.X-Powered-By;

    # Remove some headers: Apache version & OS
    unset resp.http.Server;

    # Remove some heanders: Varnish
    unset resp.http.Via;
    unset resp.http.X-Varnish;

    return (deliver);
}

sub vcl_init {
    return (ok);
}

sub vcl_fini {
    return (ok);
}