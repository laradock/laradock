# config valid for current version and patch releases of Capistrano
lock "~> 3.10.1"

set :application, "laradock"
set :repo_url, "git@github.com:laradock/laradock.git"

# Default branch is :master
set :branch,    'master'

# Default deploy_to directory is /var/www/my_app_name
set :root_path, "/var/www"
set :deploy_to, "#{ fetch(:root_path) }/production"
set :current_folder, "#{ fetch(:deploy_to) }/current"
set :shared_folder, "#{ fetch(:deploy_to) }/shared"
set :releases_folder, "#{ fetch(:deploy_to) }/releases"
set :tmp_dir, "#{ fetch(:deploy_to) }/tmp"

set :pty, true

# Default value for :linked_files is []
append :linked_files, ".env", "composer.json", "package.json", "composer.phar"

# Default value for :linked_dirs []
append :linked_dirs, "storage", "vendor"

# Default value for keep_releases is 5
set :keep_releases, 5

set :rbenv_type, :user
set :rbenv_ruby, '2.4.2'
set :rbenv_prefix, "RBENV_ROOT=#{fetch(:rbenv_path)} RBENV_VERSION=#{fetch(:rbenv_ruby)} #{fetch(:rbenv_path)}/bin/rbenv exec"

namespace :deploy do
  desc 'Restart Deploy'
  task :restart do
    on roles(:web) do
      if test("[ -d #{ current_path }/storage ]")
        execute "chmod 777 -R #{ current_path }/storage"
      else
        info "Can't find: #{ current_path }/storage folder!"
      end
    end
  end
end

namespace :chown do
  desc 'Restore Ownership Folder'
  task :restore do
    on roles(:all) do
      if test("[ -d #{ release_path }/storage]")
        execute! :sudo, "chown www-data:www-data -R #{ release_path }/storage"
      else
        info "Can't find: #{ release_path }/storage folder!"
      end
    end
  end

  task :change do
    on roles(:all) do
      if test("[ -d #{ current_path }/storage]")
        execute! :sudo, "chown www-data:www-data -R #{ current_path }/storage"
      else
        info "Can't find: #{ current_path }/storage folder!"
      end
    end
  end
end

namespace :nginx do
  desc 'Reload NGINX'
  task :manual_reload do
    on roles(:all) do
      sudo :service, :nginx, :reload
    end
  end

  desc 'Restart NGINX'
  task :manual_start do
    on roles(:all), in: :sequence do
      execute! :sudo, :service, :nginx, :restart
    end
  end

  task :manual_restart do
    on roles(:all) do
      invoke 'nginx:manual_reload'
      invoke 'nginx:manual_start'
    end
  end
end

namespace :phpfpm do
  desc 'Reload PHP-FPM'
  task :manual_reload do
    on roles(:all) do
      sudo :service, :'php7.2-fpm', :reload
    end
  end

  desc 'Restart PHP-FPM'
  task :manual_start do
    on roles(:all), in: :sequence do
      execute! :sudo, :service, :'php7.2-fpm', :restart
    end
  end

  task :manual_restart do
    on roles(:all) do
      invoke 'phpfpm:manual_reload'
      invoke 'phpfpm:manual_start'
    end
  end
end

namespace :composer do
  desc 'Install Composer'
  task :install do
    on roles(:all) do
      execute "cd #{ current_path }; composer install"
    end
  end

  desc 'Update Composer'
  task :update do
    on roles(:all) do
      execute "cd #{ current_path }; composer self-update"
    end
  end

  desc 'Dump Autoload Composer'
  task :dumpautoload do
    on roles(:all) do
      execute "cd #{ current_path }; composer dump-autoload -o"
    end
  end

  task :initialize do
    on roles(:all) do
      invoke 'composer:install'
      invoke 'composer:dumpautoload'
    end
  end
end

namespace :artisan do
  desc 'Clear View'
  task :clear_view do
    on roles(:all) do
      execute "cd #{ current_path }; php artisan view:clear"
    end
  end

  desc 'Clear Cache'
  task :clear_cache do
    on roles(:all) do
      execute "cd #{ current_path }; php artisan cache:clear"
    end
  end

  task :clear_all do
    on roles(:all) do
      invoke 'artisan:clear_view'
      invoke 'artisan:clear_cache'
    end
  end
end

after 'deploy:publishing', 'deploy:restart'
after 'deploy:restart', 'composer:initialize'
after 'deploy:restart', 'artisan:clear_all'
after 'deploy:restart', 'nginx:manual_restart'

after 'chown:restore', 'nginx:manual_restart'
after 'chown:change', 'nginx:manual_restart'

after 'nginx:manual_restart', 'phpfpm:manual_restart'
