#!/bin/bash

while [ $# -gt 0 ]; do
  case "$1" in
    -u=* | --user=*)
      LD_USER="${1#*=}"
      ;;
    -c=* | --container=*)
      LD_CONTAINER="${1#*=}"
      ;;
    -cmd=* | --command=*)
      LD_COMMAND="${1#*=}"
      ;;
    -s=* | --shell=*)
      LD_SHELL="${1#*=}"
      ;;
    *)
      LD_CONTAINER_CWD="${1#*=}"
  esac
  shift
done
