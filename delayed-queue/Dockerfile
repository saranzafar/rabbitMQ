FROM rabbitmq:3.12-management

# Download and enable delayed message exchange plugin
RUN apt-get update && apt-get install -y wget && \
    wget -q https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v4.2.0/rabbitmq_delayed_message_exchange-4.2.0.ez && \
    mv rabbitmq_delayed_message_exchange-4.2.0.ez /opt/rabbitmq/plugins/ && \
    rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange

EXPOSE 5672 15672

