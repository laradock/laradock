# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

# Configuration file for JupyterHub
import os

c = get_config()

def create_dir_hook(spawner):
    username = spawner.user.name # get the username
    volume_path = os.path.join('/user-data', username)
    if not os.path.exists(volume_path):
        # create a directory with umask 0755 
        # hub and container user must have the same UID to be writeable
        # still readable by other users on the system
        os.mkdir(volume_path, 0o755)
        os.chown(volume_path, 1000,100)
        # now do whatever you think your user needs
        # ...
        pass

# attach the hook function to the spawner
c.Spawner.pre_spawn_hook = create_dir_hook

# We rely on environment variables to configure JupyterHub so that we
# avoid having to rebuild the JupyterHub container every time we change a
# configuration parameter.

# Spawn single-user servers as Docker containers
c.JupyterHub.spawner_class = 'dockerspawner.DockerSpawner'

# Spawn containers from this image
c.DockerSpawner.image = os.environ['JUPYTERHUB_LOCAL_NOTEBOOK_IMAGE']

# JupyterHub requires a single-user instance of the Notebook server, so we
# default to using the `start-singleuser.sh` script included in the
# jupyter/docker-stacks *-notebook images as the Docker run command when
# spawning containers.  Optionally, you can override the Docker run command
# using the DOCKER_SPAWN_CMD environment variable.
spawn_cmd = os.environ.get('JUPYTERHUB_DOCKER_SPAWN_CMD', "start-singleuser.sh")
c.DockerSpawner.extra_create_kwargs.update({ 'command': spawn_cmd })

# Connect containers to this Docker network
network_name = os.environ.get('JUPYTERHUB_NETWORK_NAME','laradock_backend')
c.DockerSpawner.use_internal_ip = True
c.DockerSpawner.network_name = network_name

# Pass the network name as argument to spawned containers
c.DockerSpawner.extra_host_config = { 'network_mode': network_name, 'runtime': 'nvidia' }
# c.DockerSpawner.extra_host_config = { 'network_mode': network_name, "devices":["/dev/nvidiactl","/dev/nvidia-uvm","/dev/nvidia0"] }
# Explicitly set notebook directory because we'll be mounting a host volume to
# it.  Most jupyter/docker-stacks *-notebook images run the Notebook server as
# user `jovyan`, and set the notebook directory to `/home/jovyan/work`.
# We follow the same convention.
# notebook_dir = os.environ.get('JUPYTERHUB_DOCKER_NOTEBOOK_DIR') or '/home/jovyan/work'
notebook_dir = '/notebooks'
c.DockerSpawner.notebook_dir = notebook_dir

# Mount the real user's Docker volume on the host to the notebook user's
# notebook directory in the container
user_data = os.environ.get('JUPYTERHUB_USER_DATA','/jupyterhub')
c.DockerSpawner.volumes = {
    user_data+'/{username}': notebook_dir
}

c.DockerSpawner.extra_create_kwargs.update({ 'user': 'root'})

# volume_driver is no longer a keyword argument to create_container()
# c.DockerSpawner.extra_create_kwargs.update({ 'volume_driver': 'local' })
# Remove containers once they are stopped
c.DockerSpawner.remove_containers = True

# For debugging arguments passed to spawned containers
c.DockerSpawner.debug = True

# User containers will access hub by container name on the Docker network
c.JupyterHub.hub_ip = 'jupyterhub'
c.JupyterHub.hub_port = 8000

# TLS config
c.JupyterHub.port = 80
# c.JupyterHub.ssl_key = os.environ['SSL_KEY']
# c.JupyterHub.ssl_cert = os.environ['SSL_CERT']

# Authenticate users with GitHub OAuth
c.JupyterHub.authenticator_class = 'oauthenticator.GitHubOAuthenticator'
c.GitHubOAuthenticator.oauth_callback_url = os.environ['JUPYTERHUB_OAUTH_CALLBACK_URL']
c.GitHubOAuthenticator.client_id = os.environ['JUPYTERHUB_OAUTH_CLIENT_ID']
c.GitHubOAuthenticator.client_secret = os.environ['JUPYTERHUB_OAUTH_CLIENT_SECRET']

# Persist hub data on volume mounted inside container
data_dir = '/data'

c.JupyterHub.cookie_secret_file = os.path.join(data_dir,
    'jupyterhub_cookie_secret')

print(os.environ)

c.JupyterHub.db_url = 'postgresql://{user}:{password}@{host}/{db}'.format(
    user=os.environ['JUPYTERHUB_POSTGRES_USER'],
    host=os.environ['JUPYTERHUB_POSTGRES_HOST'],
    password=os.environ['JUPYTERHUB_POSTGRES_PASSWORD'],
    db=os.environ['JUPYTERHUB_POSTGRES_DB'],
)

# Whitlelist users and admins
c.Authenticator.whitelist = whitelist = set()
c.Authenticator.admin_users = admin = set()
c.JupyterHub.admin_access = True
pwd = os.path.dirname(__file__)
with open(os.path.join(pwd, 'userlist')) as f:
    for line in f:
        if not line:
            continue
        parts = line.split()
        name = parts[0]
        print(name)
        whitelist.add(name)
        if len(parts) > 1 and parts[1] == 'admin':
            admin.add(name)
admin.add('laradock')
