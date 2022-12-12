#!/bin/bash

action=$1
phpVersion=$2

if [ "$(whoami)" != 'root' ];
then
	echo $"You have no permission to run $0 as non-root user. Use sudo"
		exit 1;
fi

if [ "$action" != 'set' ]
	then
		echo $"You need to prompt for action (set) -- Lower-case only"
		exit 1;
fi

if [ "$action" == 'set' ]
  then

    while [ "$phpVersion" == "" ]
    do
      echo -e $"Please provide php version format 5.6 till 8.2"
      read phpVersion
    done

    echo "Switching to PHP $phpVersion"
    update-alternatives --set php /usr/bin/php$phpVersion
fi
