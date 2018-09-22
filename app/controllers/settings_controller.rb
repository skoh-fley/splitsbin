class SettingsController < ApplicationController
  def index
    redirect_to root_path if current_user.nil?
  end

  def update
    current_user.update(name: params[:user][:name])
    redirect_to(settings_path, notice: 'Username updated!')
  end

  def destroy
    current_user.runs.destroy_all if params[:destroy_runs] == '1'
    current_user.destroy
    auth_session.invalidate!
    redirect_to root_path, alert: 'Your account has been deleted. Go have fun outside :)'
  end
end
