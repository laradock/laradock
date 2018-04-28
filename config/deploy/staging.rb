server 'staging', user: 'root', roles: %w{app web}

set :branch,    'master'

# Default deploy_to directory is /var/www/my_app_name
set :root_path, "/var/www"
set :deploy_to, "#{ fetch(:root_path) }/staging"
set :current_folder, "#{ fetch(:deploy_to) }/current"
set :shared_folder, "#{ fetch(:deploy_to) }/shared"
set :releases_folder, "#{ fetch(:deploy_to) }/releases"
set :tmp_dir, "#{ fetch(:deploy_to) }/tmp"

set :pty, true

set :ssh_options, {
  forward_agent: true
}

set :default_environment, {
  'PATH' => "$HOME/.rbenv/shims:$HOME/.rbenv/bin:$PATH"
}

