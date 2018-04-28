#!/usr/bin/env sh

#####  WARNING !!!  ###########################
# YOU HAVE ALREADY KNOW WHAT YOU'RE DOING !   #
# ------------------------------------------- #
# This will remove all your saved environment #
# without mercy !                             #
# ------------------------------------------- #

sudo rm -rf cache
sudo rm -rf data
sudo rm -rf session

git checkout cache
git checkout data
git checkout session