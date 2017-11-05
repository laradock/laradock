This is a fork of the <a href="https://github.com/laradock/laradock">laradock</a> repo. 

This package allows developers to define their yml and env configurations in their project directory and submit them to their own repo.

Usage:

Submodule this repo into your project:

```
git submodule add --name laradock-my-project --force https://github.com/heyorca/laradock.git laradock-my-project
```

Your project tree should look like something like this:

```
- my-project
    - public
    - stuff
    - laradock-my-project (submodule)
        - .env (symlink to ../laradock-env)
        - docker-compose (symlink to ../laradock-docker-compose)
    - laradock-env
    - laradock-docker-compose.yml
```
    
Run `docker-compose up` from the laradock directory and you should see dockers running based on the parent laradock-env and laradock-docker-compose.yml file.

You can use the example-env and example-docker-compose files in the laradock directory to build your project's laradock configurations.

## License

[MIT License](https://github.com/laradock/laradock/blob/master/LICENSE)

