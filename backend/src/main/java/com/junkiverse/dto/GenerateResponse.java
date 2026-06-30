package com.junkiverse.dto;

import com.junkiverse.entity.WorkStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 生成角色响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateResponse {

    /**
     * 作品 ID
     */
    private Long id;

    /**
     * 生成状态
     */
    private WorkStatus status;

    /**
     * AI 生成的角色立绘 URL
     */
    private String characterImage;

    /**
     * 角色名称
     */
    private String characterName;

    /**
     * 角色档案故事
     */
    private String characterStory;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 创建时间
     */
    private String createdAt;
}
