FROM ruby:2.6.4-alpine

# Build base for gem's native extensions
# tzdata for ruby timezone data
# gcompat for ffi to load LSC
RUN echo "http://dl-4.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
    && apk update \
    && apk add -u --no-cache build-base tzdata gcompat git postgresql-dev bash yarn \
    && rm -rf /var/cache/apk/*

ENV LANG C.UTF-8
ENV GEM_HOME bundle
ENV BUNDLE_PATH $GEM_HOME
ENV BUNDLE_APP_CONFIG $BUNDLE_PATH
ENV BUNDLE_BIN $BUNDLE_PATH/bin
# Add bundle dir to path to be able to access commands outside of `bundle exec`
ENV PATH /app/bin:$BUNDLE_BIN:$PATH

RUN gem update --system

RUN mkdir -p /app
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install
