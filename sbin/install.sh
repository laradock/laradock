# sudo apt-get remove -y docker docker-engine docker.io containerd runc
# sudo apt remove --purge -y python-pip python3-pip
# sudo apt remove --purge -y python3
# sudo apt autoremove

sudo apt-get update
sudo apt-get install -y \
   apt-transport-https \
   ca-certificates \
   curl \
   gnupg-agent \
   software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
# --allow-insecure-repositories
sudo add-apt-repository -y \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

apt-cache madison docker-ce
sudo apt-get install -y docker-ce=5:19.03.14~3-0~ubuntu-focal docker-ce-cli=5:19.03.14~3-0~ubuntu-focal containerd.io
sudo docker run hello-world
sudo usermod -aG docker $USER

sudo apt install -y python3-distutils
sudo apt install -y python3-pip
sudo pip install pyyaml
