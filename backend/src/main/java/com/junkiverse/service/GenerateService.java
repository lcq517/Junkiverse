package com.junkiverse.service;

import com.junkiverse.dto.GenerateRequest;
import com.junkiverse.dto.GenerateResponse;
import com.junkiverse.entity.Work;
import com.junkiverse.entity.WorkStatus;
import com.junkiverse.repository.WorkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 生成服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GenerateService {

    private final WorkRepository workRepository;
    private final AiApiService aiApiService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * 创建生成任务
     */
    @Transactional
    public GenerateResponse createGenerateTask(GenerateRequest request) {
        log.info("创建生成任务，部件数量：{}", request.getParts() != null ? request.getParts().size() : 0);

        // 保存作品记录
        Work work = Work.builder()
                .collageImage(request.getCollageImage())
                .status(WorkStatus.GENERATING)
                .build();

        work = workRepository.save(work);
        log.info("作品记录已创建，ID：{}", work.getId());

        // 异步执行 AI 生成
        generateAsync(work.getId(), request);

        return toResponse(work);
    }

    /**
     * 异步执行 AI 生成
     */
    @Async
    public void generateAsync(Long workId, GenerateRequest request) {
        log.info("开始异步生成，作品ID：{}", workId);

        try {
            Work work = workRepository.findById(workId).orElseThrow();
            GenerateRequest.Part[] parts = request.getParts() != null
                    ? request.getParts().toArray(new GenerateRequest.Part[0])
                    : new GenerateRequest.Part[0];

            // 生成角色名
            String characterName = aiApiService.generateCharacterName(parts);
            log.info("生成角色名：{}", characterName);

            // 生成角色立绘
            String characterImage = aiApiService.generateCharacterImage(request.getCollageImage(), parts);
            log.info("生成角色立绘完成");

            // 生成故事
            String story = aiApiService.generateCharacterStory(characterName, parts);
            log.info("生成故事完成");

            // 更新作品
            work.setCharacterName(characterName);
            work.setCharacterImage(characterImage);
            work.setCharacterStory(story);
            work.setStatus(WorkStatus.DONE);

            workRepository.save(work);
            log.info("作品生成完成，ID：{}", workId);

        } catch (Exception e) {
            log.error("生成失败，作品ID：{}", workId, e);
            workRepository.findById(workId).ifPresent(w -> {
                w.setStatus(WorkStatus.FAILED);
                w.setErrorMessage(e.getMessage());
                workRepository.save(w);
            });
        }
    }

    /**
     * 查询生成结果
     */
    public GenerateResponse getGenerateResult(Long id) {
        log.debug("查询生成结果，ID：{}", id);

        Work work = workRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("作品不存在：" + id));

        return toResponse(work);
    }

    /**
     * 获取最近的作品列表
     */
    public List<GenerateResponse> getRecentWorks() {
        log.debug("获取最近作品列表");

        return workRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * 转换为响应对象
     */
    private GenerateResponse toResponse(Work work) {
        return GenerateResponse.builder()
                .id(work.getId())
                .status(work.getStatus())
                .characterImage(work.getCharacterImage())
                .characterName(work.getCharacterName())
                .characterStory(work.getCharacterStory())
                .errorMessage(work.getErrorMessage())
                .createdAt(work.getCreatedAt() != null ? work.getCreatedAt().format(DATE_FORMATTER) : null)
                .build();
    }
}
