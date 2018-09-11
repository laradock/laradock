#!/bin/bash

#
#
#

set -e

resolve_absolute_dir()
{
    SOURCE="${BASH_SOURCE[0]}"
    while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
      DIR="$( cd -P "$( dirname ${SOURCE} )" && pwd )"
      SOURCE="$(readlink ${SOURCE})"
      [[ ${SOURCE} != /* ]] && SOURCE="${DIR}/${SOURCE}" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
    done
    ABSOLUTE_BIN_PATH="$( cd -P "$( dirname ${SOURCE} )" && pwd )"
    ABSOLUTE_PATH="${ABSOLUTE_BIN_PATH}/.."
}

init_dirs()
{
    resolve_absolute_dir
    export COMMANDS_DIR="${ABSOLUTE_PATH}/commands"
    export TASKS_DIR="${ABSOLUTE_PATH}/tasks"
    export PROPERTIES_DIR="${ABSOLUTE_PATH}/properties"
}

usage()
{
    printf "${YELLOW}Usage:${COLOR_RESET}\n"
    echo " command"
    echo ""
    printf "${YELLOW}Available commands:${COLOR_RESET}\n"
	for script in "$COMMANDS_DIR"/*
	do
	    COMMAND_BASENAME=$(basename ${script})
    	printf " ${GREEN}${COMMAND_BASENAME%.sh}${COLOR_RESET}\n"
	done
}

init_dirs
source ${TASKS_DIR}/load_properties.sh

set +u
if [ -z "$1" ] || [ "$1" == "--help" ]; then
  usage
  exit 0
fi
set -u

COMMAND_NAME="$1.sh"
if [ ! -f ${COMMANDS_DIR}/${COMMAND_NAME} ]; then
    printf "${RED}Command not found${COLOR_RESET}\n"
    printf " Execute ${GREEN}ondocker --help${COLOR_RESET} to see commands available\n"
    exit 1
fi

shift
${COMMANDS_DIR}/${COMMAND_NAME} "$@"