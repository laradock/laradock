#!/usr/bin/env sh

FOLDERS="$HOME/workspace/*/"

sudo rm -fr \
    "${FOLDERS}node_modules" \
    "${FOLDERS}storage/framework/cache/*" \
    "${FOLDERS}var/cache/*" \
    "${FOLDERS}vendor"

FOLDERS="~/workspaces/*/*/"

sudo rm -fr \
    "${FOLDERS}node_modules" \
    "${FOLDERS}storage/framework/cache/*" \
    "${FOLDERS}var/cache/*" \
    "${FOLDERS}vendor"

FOLDERS="~/workspaces/*/*/*/"

sudo rm -fr \
    "${FOLDERS}node_modules" \
    "${FOLDERS}storage/framework/cache/*" \
    "${FOLDERS}var/cache/*" \
    "${FOLDERS}vendor"