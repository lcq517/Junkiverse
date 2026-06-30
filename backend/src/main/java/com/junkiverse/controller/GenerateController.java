package com.junkiverse.controller;

import com.junkiverse.dto.GenerateRequest;
import com.junkiverse.dto.GenerateResponse;
import com.junkiverse.service.GenerateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 生成 Controller
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class GenerateController {

    private final GenerateService generateService;

    /**
     * 创建生成任务
     *
     * POST /api/generate/character
     */
    @PostMapping("/generate/character")
    public ResponseEntity<GenerateResponse> createGenerateTask(@RequestBody GenerateRequest request) {
        log.info("收到生成请求，部件数量：{}", request.getParts() != null ? request.getParts().size() : 0);
        GenerateResponse response = generateService.createGenerateTask(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 查询生成结果
     *
     * GET /api/generate/{id}
     */
    @GetMapping("/generate/{id}")
    public ResponseEntity<GenerateResponse> getGenerateResult(@PathVariable Long id) {
        log.info("查询生成结果，ID：{}", id);
        GenerateResponse response = generateService.getGenerateResult(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取最近作品列表
     *
     * GET /api/works
     */
    @GetMapping("/works")
    public ResponseEntity<List<GenerateResponse>> getRecentWorks() {
        log.info("获取最近作品列表");
        List<GenerateResponse> works = generateService.getRecentWorks();
        return ResponseEntity.ok(works);
    }

    /**
     * 健康检查
     *
     * GET /api/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "junkiverse-backend"
        ));
    }
}
