package com.junkiverse.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * 异步配置
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // 使用默认的 SimpleAsyncTaskExecutor
    // 如需线程池，可配置 ThreadPoolTaskExecutor
}
