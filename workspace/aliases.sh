#! /bin/bash

# Colors used for status updates
ESC_SEQ="\x1b["
COL_RESET=$ESC_SEQ"39;49;00m"
COL_RED=$ESC_SEQ"31;01m"
COL_GREEN=$ESC_SEQ"32;01m"
COL_YELLOW=$ESC_SEQ"33;01m"
COL_BLUE=$ESC_SEQ"34;01m"
COL_MAGENTA=$ESC_SEQ"35;01m"
COL_CYAN=$ESC_SEQ"36;01m"

# Detect which `ls` flavor is in use
if ls --color > /dev/null 2>&1; then # GNU `ls`
	colorflag="--color"
	export LS_COLORS='no=00:fi=00:di=01;31:ln=01;36:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arj=01;31:*.taz=01;31:*.lzh=01;31:*.zip=01;31:*.z=01;31:*.Z=01;31:*.gz=01;31:*.bz2=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.jpg=01;35:*.jpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.avi=01;35:*.fli=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.ogg=01;35:*.mp3=01;35:*.wav=01;35:'
else # macOS `ls`
	colorflag="-G"
	export LSCOLORS='BxBxhxDxfxhxhxhxhxcxcx'
fi

# List all files colorized in long format
#alias l="ls -lF ${colorflag}"
### MEGA: I want l and la ti return hisdden files
alias l="ls -laF ${colorflag}"

# List all files colorized in long format, including dot files
alias la="ls -laF ${colorflag}"

# List only directories
alias lsd="ls -lF ${colorflag} | grep --color=never '^d'"

# Always use color output for `ls`
alias ls="command ls ${colorflag}"

# Commonly Used Aliases
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias ~="cd ~" # `cd` is probably faster to type though
alias -- -="cd -"
alias home="cd ~"

alias h="history"
alias j="jobs"
alias e='exit'
alias c="clear"
alias cla="clear && ls -la"
alias cll="clear && ls -l"
alias cls="clear && ls"
alias code="cd /var/www"
alias ea="vi ~/aliases.sh"

# Always enable colored `grep` output
# Note: `GREP_OPTIONS="--color=auto"` is deprecated, hence the alias usage.
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

alias art="php artisan"
alias artisan="php artisan"
alias cdump="composer dump-autoload -o"
alias composer:dump="composer dump-autoload -o"
alias db:reset="php artisan migrate:reset && php artisan migrate --seed"
alias dusk="php artisan dusk"
alias fresh="php artisan migrate:fresh"
alias migrate="php artisan migrate"
alias refresh="php artisan migrate:refresh"
alias rollback="php artisan migrate:rollback"
alias seed="php artisan db:seed"
alias serve="php artisan serve --quiet &"

alias phpunit="./vendor/bin/phpunit"
alias pu="phpunit"
alias puf="phpunit --filter"
alias pud='phpunit --debug'

alias cc='codecept'
alias ccb='codecept build'
alias ccr='codecept run'
alias ccu='codecept run unit'
alias ccf='codecept run functional'

alias g="gulp"
alias npm-global="npm list -g --depth 0"
alias ra="reload"
alias reload="source ~/.aliases && echo \"$COL_GREEN ==> Aliases Reloaded... $COL_RESET \n \""
alias run="npm run"
alias tree="xtree"

# Xvfb
alias xvfb="Xvfb -ac :0 -screen 0 1024x768x16 &"

# requires installation of 'https://www.npmjs.com/package/npms-cli'
alias npms="npms search"
# requires installation of 'https://www.npmjs.com/package/package-menu-cli'
alias pm="package-menu"
# requires installation of 'https://www.npmjs.com/package/pkg-version-cli'
alias pv="package-version"
# requires installation of 'https://github.com/sindresorhus/latest-version-cli'
alias lv="latest-version"

# git aliases
alias gaa="git add ."
alias gd="git --no-pager diff"
alias git-revert="git reset --hard && git clean -df"
alias gs="git status"
alias whoops="git reset --hard && git clean -df"
alias glog="git log --oneline --decorate --graph"
alias gloga="git log --oneline --decorate --graph --all"
alias gsh="git show"
alias grb="git rebase -i"
alias gbr="git branch"
alias gc="git commit"
alias gck="git checkout"

# Create a new directory and enter it
function mkd() {
    mkdir -p "$@" && cd "$@"
}

function md() {
    mkdir -p "$@" && cd "$@"
}

function xtree {
    find ${1:-.} -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'
}

# `tre` is a shorthand for `tree` with hidden files and color enabled, ignoring
# the `.git` directory, listing directories first. The output gets piped into
# `less` with options to preserve color and line numbers, unless the output is
# small enough for one screen.
function tre() {
	tree -aC -I '.git|node_modules|bower_components' --dirsfirst "$@" | less -FRNX;
}

# Determine size of a file or total size of a directory
function fs() {
	if du -b /dev/null > /dev/null 2>&1; then
		local arg=-sbh;
	else
		local arg=-sh;
	fi
	if [[ -n "$@" ]]; then
		du $arg -- "$@";
	else
		du $arg .[^.]* ./*;
	fi;
}
