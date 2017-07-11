#!/bin/bash
#
# Laradock Shell CLI
#

readonly LARADOCK_ROOT="$(cd "$(dirname "$BASH_SOURCE")/.."; pwd)"
readonly SCRIPTS_PATH="$LARADOCK_ROOT/scripts"

source "$SCRIPTS_PATH/configs/variables.sh"

# Arrays of user-defined input arguments and
# specified options and corresponding values
declare -a arguments=( )
declare -A options=( )

# User specified command to execute
COMMAND=

#-----------------------------------------------------------
# Include Functions
#-----------------------------------------------------------

source "$SCRIPTS_PATH/functions/helpers.sh"
source "$SCRIPTS_PATH/functions/processinput.sh"
source "$SCRIPTS_PATH/functions/output.sh"
source "$SCRIPTS_PATH/functions/executor.sh"

#-----------------------------------------------------------
# Include Commands
#-----------------------------------------------------------

source "$SCRIPTS_PATH/commands/environvars.sh"
source "$SCRIPTS_PATH/commands/dockercompose.sh"

#-----------------------------------------------------------
# Main
#-----------------------------------------------------------

main()
{
  process_arguments "$@"
  execute_command
}

main "$@"
