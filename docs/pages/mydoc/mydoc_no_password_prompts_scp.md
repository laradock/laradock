---
title: Getting around the password prompts in SCP
sidebar: mydoc_sidebar
tags: [publishing, troubleshooting]
permalink: mydoc_no_password_prompts_scp.html
summary: "You can publish your docs via SSH through a Terminal window or more likely, via a shell script that you simply execute as part of the publishing process. However, you will be prompted for your password with each file transfer unless you configure passwordless SSH. The basic process for setting up password less SSH is to create a key on your own machine that you also transfer to the remote machine. When you use the SCP command, the remote machine checks that you have the authorized key and allows access without a password prompt."
folder: mydoc
---

## Get rid of password prompts


To remove the password prompts when connecting to servers via SSH:

1. On your local machine, go to your .ssh directory:

   ```
   cd ~/.ssh
   ```

   Note that any directory that starts with a dot, like .ssh, is hidden. You can view hidden folders by enabling them on your Mac. See [this help topic](http://ianlunn.co.uk/articles/quickly-showhide-hidden-files-mac-os-x-mavericks/). Additionally, when you look at the files in a directory, use ls -a instead of just ls to view the hidden files.

   If you don't have an .ssh directory, create one with `mkdir .ssh`.

2. Create a new key inside your .ssh directory:

   ```
   ssh-keygen -t rsa
   ```

3. Press **Enter**. When prompted about "Enter file in which to save the key ...", press ```Enter``` again.

   This will create a file called id_rsa.pub (the key) and id_rsa (your identification) in this .ssh folder.

   When prompted for a passphrase for the key, just leave it empty and press **Enter** twice. You should see something like this:

   ```   
   tjohnson-mbpr13:.ssh tjohnson$ ssh-keygen -t rsa
   Generating public/private rsa key pair.
   Enter passphrase (empty for no passphrase):
   Enter same passphrase again:
   Your identification has been saved in /Users/yourname/.ssh/id_rsa.
   Your public key has been saved in /Users/yourname/.ssh/id_rsa.pub.
   The key fingerprint is:
   9a:8f:b5:495:39:78:t5:dc:19:d6:29:66:02:e8:02:a0 yourname@yourname-mbpr99.local
   ```

   The key's randomart image is:

   ```
   +--[ RSA 2048]----+
   |.                |
   |+                |
   |E                |
   |o.   .           |
   |.. = o S        |
   |.&^  + 7i = o       |
   |      = B .      |
   |     o O +       |
   |      *.o        |
   +-----------------+
   ```

   As you can see, RSA draws a picture for you. Take a screenshot of the picture, print it out, and put it up on your fridge.

4. Open up another terminal window (in iTerm, open another tab), and SSH in to your remote server:

   ```
   ssh <your_username>@remoteserver.com
   ```

5. Change `<your_username>` to your actual username, such as tjohnson.

   When you connect, you'll be prompted for your password.

   When you connect, by default you are routed to the personal folder on the directory. For example, `/home/remoteserver/<your_username>`. To see this directory, type `pwd` (or `dir` on Windows).

6. Create a new directory called .ssh on remoteserver.com server inside the `/home/remoteserver/<your_username>` directory.

   ```
  mkdir -p .ssh
   ```

   You can ensure that it's there with this command:

   ```
   ls -a
   ```

   Without the -a, the hidden directory won't be shown.

7. Open another Terminal window and browse to /Users/<your_username>/.ssh on your local machine.

   ```
   cd ~/.ssh
   ```

8. Copy the id_rsa.pub from the /.ssh directory on your local machine to the /home/remoteserver/<your_username>/.ssh directory on the remoteserver server:

   ```
   scp id_rsa.pub <your-username>@yourserver.com:/home/remoteserver/<your-username>/.ssh
   ```

9. Switch back into your terminal window that is connected to remoteserver.com, change directory to the .ssh directory, and rename the file from id_rsa.pub to `authorized_keys` (without any file extension):

   ```
   mv id_rsa.pub authorized_keys
   ```

10. Change the file permissions to 700:

    ```
    chmod 700 authorized_keys
    ```

    Now you should be able to SSH onto remoteserver without any password prompts.

11. Open another terminal (which is not already SSH'd into remoteserver.com) and try the following:

    ```
    ssh <your_username>@remoteserver.com
    ```

    If successful, you shouldn't be prompted for a password.

    Now that you can connect without password prompts, you can use the scp scripts to transfer files to the server without  password prompts. For example:

    ```
    scp -r ../doc_outputs/mydoc/writers <your-username>@remoteserver:/var/www/html/
    ```

{% include links.html %}
