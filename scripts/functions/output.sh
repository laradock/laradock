#!/bin/bash

command_arg()
{
  echo -n "$@"
}

prepend_empty_line()
{
  sed -e '1 i\ ' | sed -e '1 s/ //'
}

echo_divider()
{
  sed -e :a -e '1 s/^.\{1,'${1:-$DIV_COLUMNS}'\}$/&#/;ta'
}

echo_divheader()
{
  sed -e '1 s/^.*$/& /' | echo_divider
}

echo_header()
{
  echo '#' | echo_divider 30 | prepend_empty_line
  echo "# $@"
  echo '#' | echo_divider 30
}
