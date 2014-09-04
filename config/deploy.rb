# config valid only for current version of Capistrano
lock '3.2.1'

set :application, 'addmoreapp'
set :repo_url, 'git@gitlab.com:mtrinitaria/addmoreapp.git'

# Default branch is :master
# ask :branch, proc { `git rev-parse --abbrev-ref HEAD`.chomp }.call

# Default deploy_to directory is /var/www/my_app
# set :deploy_to, '/var/www/my_app'

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
# set :linked_files, %w{config/database.yml}

# Default value for linked_dirs is []
# set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

namespace :deploy do

  desc 'Restart application'
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
      # Your restart mechanism here, for example:
      # execute :touch, release_path.join('tmp/restart.txt')

      execute "ln -nfs #{shared_path}/bower_components/ #{release_path}/bower_components/; true"
      execute "ln -nfs #{shared_path}/node_modules/ #{release_path}/node_modules/; true"
      # execute "cp -R #{shared_path}/bower_components/. #{release_path}/bower_components/"
      # execute "cp -R #{shared_path}/node_modules/. #{release_path}/node_modules/"

      execute "cd #{release_path}/ && grunt forever:server1:restart"
      # execute "fetch(:serverstart)"
      # execute "grunt forever:server1:stop"
      # execute "grunt forever:server1:start"

      # execute "ln -nfs #{release_path} /var/www/html; true"
    end
  end

  after :publishing, :restart

  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
    end
  end

end
