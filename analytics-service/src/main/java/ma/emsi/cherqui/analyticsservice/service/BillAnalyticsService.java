package ma.emsi.cherqui.analyticsservice.service;

import ma.emsi.cherqui.analyticsservice.model.BillEvent;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.KeyValue;
import org.apache.kafka.streams.kstream.Grouped;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Materialized;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.support.serializer.JsonSerde;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class BillAnalyticsService {

    @Bean
    public Function<KStream<String, BillEvent>, KStream<String, Long>> billCounter() {
        return input -> input
                .map((k, v) -> new KeyValue<>(String.valueOf(v.getCustomerId()), v))
                .groupByKey(Grouped.with(Serdes.String(), new JsonSerde<>(BillEvent.class)))
                .count(Materialized.as("bill-counts"))
                .toStream();
    }
}
