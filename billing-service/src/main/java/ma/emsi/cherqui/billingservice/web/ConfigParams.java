package ma.emsi.cherqui.billingservice.web;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "global.params")
public record ConfigParams(int p1,int p2) {}
