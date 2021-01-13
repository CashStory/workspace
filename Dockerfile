FROM node:alpine
ENV VERSION 1.4.6
LABEL org.label-schema.build-date=$BUILD_DATE \
  org.label-schema.name="Workspace Front" \
  org.label-schema.description="Frontend of cashstory" \
  org.label-schema.url="https://cashstory.com" \
  org.label-schema.vcs-ref=$VCS_REF \
  org.label-schema.vcs-url="https://github.com/CashStory/bob" \
  org.label-schema.vendor="Cashstory, Inc." \
  org.label-schema.version=$VERSION \
  org.label-schema.schema-version="1.0"

ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV production
ENV TZ Europe/Paris

RUN mkdir -p /app
WORKDIR /app

# Copy files
COPY . /app/

# install dependency
RUN npm i

CMD [ "node", "serve.js" ]
