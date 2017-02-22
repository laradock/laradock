---
title: Git notes and tips
summary: "If you're interacting with your team using Git, the notes and tips will help you collaborate efficiently."
tags: collaboration
keywords: git, github, collaboration, interaction, file sharing, push
published: false
sidebar: mydoc_sidebar
permalink: mydoc_git_collaboration.html
folder: mydoc
---


hg fetch does a pull and update at the same time
you're prompted about any conflicts
you fix them. then you do this:


hg pull -u (i think this is pull and then update)

$ hg [COMMAND] [ARGUMENTS]

hg init
hg add
hg log
hg diff
hg revert
hg remove
hg update
You have seen that it is possible to switch revision using hg update.
clone

commit

The first feature of the diff command is to show the differences between the last revision of a file (the state at the last commit command) and the current version. It can also show the differences between any two specified revisions. For example, on apache2.conf, the diff command can be used as follows:
$ hg diff -r 1 -r 2 apache2.conf

To print each line of a file with the revision at which the line was created (and with the --user option, we come to know who committed this revision), type:
$ hg annotate [FILE] or $ hg blame [FILE]

To search for a pattern in version controlled files, use hg grep; it will search this pattern in every version of the file and it will print the first one in which it appears, such as hg annotate. For example:
$ hg grep new apache2.conf

You can also print the content of a file at a given revision even without changing the current working directory using hg cat -r REVISION.

Whenever changes have been committed but not yet pushed, the outgoing command lists all the changesets that are present in the current repository but not yet found in the destination (the ones that are candidates to be pushed), whereas the incoming command shows you the changesets that are found in the source repository but have not been pulled yet. So here, if you use the outgoing command, you will see

push
pull
fetch
merge
resolve --mark

As you can see, you have added John's change to your repository because hg log is listing it. But it is not yet present in your working copy; you need to update the working directory to the tip revision, which is the default of the update command, when no revision is passed as argument:

You can now see John's change in the working directory. If some files had been modified, either committed or not, the modifications would have been seamlessly merged with that of John's. If there was a conflict, Mercurial would have told us.

hg pull --update or -u: This option combines both the pull and the update commands, not only pulling new changesets into the local repository, but also updating the working directory to the head of these new changes.

| annotate, blame | show changeset information by line for each file |
| diff | diff repository (or selected files) |
| forget {filename} | forget the specified files on the next commit |


hg fetch. This extension acts as a combination of hg pull -u, hg merge and hg commit. It begins by pulling changes from another repository into the current repository. If it finds that the changes added a new head to the repository, it updates to the new head, begins a merge, then (if the merge succeeded) commits the result of the merge with an automatically-generated commit message. If no new heads were added, it updates the working directory to the new tip changeset.



i like

hg fetch does a pull and update at the same time
you're prompted about any conflicts
you fix them. then you do this: hg resolve --mark


hg pull -u (i think this is pull and then update)

$ hg [COMMAND] [ARGUMENTS]

hg init
hg add
hg log
hg diff
hg revert
hg remove
hg update
You have seen that it is possible to switch revision using hg update.
clone
addremove, which allows you to automatically add all new files and remove (from version control) files that have been deleted.
log
commit

The first feature of the diff command is to show the differences between the last revision of a file (the state at the last commit command) and the current version. It can also show the differences between any two specified revisions. For example, on apache2.conf, the diff command can be used as follows:
$ hg diff -r 1 -r 2 apache2.conf

To print each line of a file with the revision at which the line was created (and with the --user option, we come to know who committed this revision), type:
$ hg annotate [FILE] or $ hg blame [FILE]

To search for a pattern in version controlled files, use hg grep; it will search this pattern in every version of the file and it will print the first one in which it appears, such as hg annotate. For example:
$ hg grep new apache2.conf

You can also print the content of a file at a given revision even without changing the current working directory using hg cat -r REVISION.

Whenever changes have been committed but not yet pushed, the outgoing command lists all the changesets that are present in the current repository but not yet found in the destination (the ones that are candidates to be pushed), whereas the incoming command shows you the changesets that are found in the source repository but have not been pulled yet. So here, if you use the outgoing command, you will see

push
pull
fetch
merge
resolve --mark

As you can see, you have added John's change to your repository because hg log is listing it. But it is not yet present in your working copy; you need to update the working directory to the tip revision, which is the default of the update command, when no revision is passed as argument:

You can now see John's change in the working directory. If some files had been modified, either committed or not, the modifications would have been seamlessly merged with that of John's. If there was a conflict, Mercurial would have told us.

hg pull --update or -u: This option combines both the pull and the update commands, not only pulling new changesets into the local repository, but also updating the working directory to the head of these new changes.

Bookmarks are tags that move forward automatically to subsequent changes, leaving no mark on the changesets that previously had that bookmark pointing toward them. Named branches, on the other hand, are indelible marks that are part of a changeset. Multiple heads can be on the same branch, but only one head at a time can be pointed to by the same bookmark. Named branches are pushed/pulled from repo to repo, and bookmarks don't travel.

The default branch name in Mercurial is “default”.

The slowest, safest way to create a branch with Mercurial is to make a new clone of the repository. this is really fascinating -- a clone is merely a branch.

Discarding a branch you don’t want any more is very easy with cloned branches. It’s as simple as rm -rf test-project-feature-branch. There’s no need to mess around with editing repository history, you just delete the damn thing.

The next way to branch is to use a bookmark. For example:

$ cd ~/src/test-project
$ hg bookmark main
$ hg bookmark feature
Now you’ve got two bookmarks (essentially a tag) for your two branches at the current changeset.

To switch to one of these branches you can use hg update feature to update to the tip changeset of that branch and mark yourself as working on that branch. When you commit, it will move the bookmark to the newly created changeset.


## Git
HEAD is a reference to the last commit in the current checked out branch.

This is a good tutorial: https://www.digitalocean.com/community/tutorials/how-to-use-git-branches.


## Branching

| Commands | Description |
|------|-------|
| List all branches | `git branch a` (the * indicates the branch you're on) |
| Create new branch | `git -b branchname` or `git branch branchname` |
| Checkout a branch | `git checkout branchname` |
| Create new branch and checkout at the same time| `git checkout -b branchname` |
| Merge into current branch | First go into the branch you want to merge changes into. Then do `git merge branchname`. For example, to merge branch b into branch master, first checkout branch master: `git checkout a`. Now merge b into master: `git merge b`.|

git lg

git checkout master
git merge search | git merge --no-ff search

the latter (--no-ff) keeps the additional information that these commits were made on a branch.
then type a commit message (:wq)
git branch -d search

git add . (works same as add --all)
git commit am "my commit message" (this performs both adding and commit message at same time)

with merge conflicts:

git status (shows you all the files that can't be added due to merge conflicts)
fix the conflicts
then git add . (tells git you fixed the conflicts)
then git status
git commit

From the interface, you can also create a pull request to merge all of the changes from a specific branch into another branch.



## General commands

| Commands | Description |
|------|-------|
| start tracking files | `git add` |
| see what has changed since last commit | `git diff` |
| commit changes | `git commit` |
| | |


{% include links.html %}
