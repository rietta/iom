
[![Code Climate](https://codeclimate.com/github/rietta/iom.png)](https://codeclimate.com/github/rietta/iom)
[![Dependency Status](https://gemnasium.com/rietta/iom.svg)](https://gemnasium.com/rietta/iom)


# Welcome to NGOAIDMAP

NGOAIDMAP is a website available at http://ngoaidmap.org/. It was a custom development done initially by Vizzuality (vizzuality.com) for Interaction (interaction.org). The application consist of a database of projects. Those projects get aggregated to create Sites, for example http://foodsecurity.ngoaidmap.org/ or http://haiti.ngoaidmap.org/

It is probably a very specific application to be used directly, but the ideas and code behind it might be applicable for other people needs. If you have questions on how to use contact@vizzuality.com

## Database structure

NGOAIDMAP is a project that allows you to create websites about projects around a certain topic. For example haiti or foodsecurity.

The database consist of 4 main tables: "projects" done by "organizations" funded by "donors" which are included in different "sites".

Take a look at the database schema at db/db_schema.pdf to get a better idea of what the project does.

## Requirements

NGOAIDMAP is a Ruby on Rails application. The dependencies are:

- Ruby 1.8.7
- PostgreSQL 8.4 or higher.
- Postgis 1.5.2
 - Bundler gem

## Installation

```
        rvm use 1.8.7
        rvm gemset create iom
        rvm use 1.8.7@iom
        gem install bundler
        git clone git://github.com/Vizzuality/iom.git
        cd iom
        bundle install
        # edit config/database.yml
        rake db:setup
        rails s
```

