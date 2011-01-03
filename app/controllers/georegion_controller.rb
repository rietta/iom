class GeoregionController < ApplicationController

  layout 'site_layout'

  def show
    render_404 and return if params[:ids].blank?
    render_404 and return unless params[:ids] =~ /([\d|\/]+)/
    render_404 and return unless $1.size == params[:ids].size

    geo_ids = params[:ids].split('/')

    @area = country = Country.find(geo_ids[0], :select => Country.custom_fields)
    render_404 and return unless country

    if geo_ids.size == 1
      @projects = Project.custom_find @site, :country => country.name,
                                             :per_page => 10,
                                             :page => params[:page],
                                             :order => 'created_at DESC',
                                             :start_in_page => params[:start_in_page]

      # TODO
      @area_parent = "America"

      sql="select *,
        (select the_geom_geojson from regions where id=subq.id) as geojson
        from(
        select c.id,count(ps.project_id) as count,c.name,c.center_lon as lon,c.center_lat as lat
        from (countries_projects as cp inner join projects_sites as ps on cp.project_id=ps.project_id and site_id=#{@site.id})
        inner join countries as c on cp.country_id=c.id and c.id=#{country.id}
        group by c.id,c.name,lon,lat) as subq"
    end

    if @site.navigate_by_level1? && geo_ids.size > 1
      render_404 and return if geo_ids.size > 2

      region = Region.find(geo_ids[1], :select => Region.custom_fields, :conditions => {:level => 1, :country_id => country.id})
      render_404 and return unless region

      @area = region
    end

    if @site.navigate_by_level2? && geo_ids.size > 2
      render_404 and return if geo_ids.size > 3

      region = Region.find(geo_ids[2], :select => Region.custom_fields, :conditions => {:level => 2, :country_id => country.id, :parent_region_id => geo_ids[1]})
      render_404 and return unless region

      @area = region
    end

    if @site.navigate_by_level3? && geo_ids.size > 3
      render_404 and return if geo_ids.size > 4

      parent_region = Region.find(geo_ids[2], :select => Region.custom_fields, :conditions => {:level => 2, :country_id => country.id, :parent_region_id => geo_ids[1]})
      render_404 and return unless parent_region

      region = Region.find(geo_ids[3], :select => Region.custom_fields, :conditions => {:level => 3, :country_id => country.id, :parent_region_id => geo_ids[2]})
      render_404 and return unless region

      @area = region
    end

    if @area.is_a?(Region)
      @projects = Project.custom_find @site, :region => @area.name,
                                             :per_page => 10,
                                             :page => params[:page],
                                             :order => 'created_at DESC',
                                             :start_in_page => params[:start_in_page]

      @area_parent = country.name
      sql="select *,(select the_geom_geojson from regions where id=subq.id) as geojson
        from(
        select r.id,count(ps.project_id) as count,r.name,r.center_lon as lon,r.center_lat as lat
        from (projects_regions as pr inner join projects_sites as ps on pr.project_id=ps.project_id and site_id=#{@site.id})
        inner join regions as r on pr.region_id=r.id and r.id=#{@area.id}
        group by r.id,r.name,lon,lat) as subq"
    end

    respond_to do |format|
      format.html do
        result = ActiveRecord::Base.connection.execute(sql)
        @map_data = result.first
        @georegion_map_chco = @site.theme.data[:georegion_map_chco]
        @georegion_map_chf = @site.theme.data[:georegion_map_chf]
        @georegion_map_marker_source = @site.theme.data[:georegion_map_marker_source]
        @georegion_map_stroke_color = @site.theme.data[:georegion_map_stroke_color]
        @georegion_map_fill_color = @site.theme.data[:georegion_map_fill_color]

        areas= []
        data = []
        @map_data_max_count=0
        result.each do |c|
          areas << c["code"]
          data  << c["count"]
          if(@map_data_max_count < c["count"].to_i)
            @map_data_max_count=c["count"].to_i
          end
        end
        @chld = areas.join("|")
        @chd  = "t:"+data.join(",")

        @first_three = @area.projects_clusters(@site)[0...3]
        @first_three_max = @first_three.map{|g, c| c}.sort.last
      end
      format.js do
        render :update do |page|
          page << "$('#projects_view_more').remove();"
          page << "$('#projects').append('#{escape_javascript(render(:partial => 'projects/projects'))}');"
          page << "IOM.ajax_pagination();"
          page << "resizeColumn();"
        end
      end
    end

  end

end