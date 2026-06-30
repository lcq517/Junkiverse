package com.junkiverse.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 作品实体类
 */
@Entity
@Table(name = "works")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Work {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 拼贴图片（Base64 或 URL）
     */
    @Column(columnDefinition = "TEXT")
    private String collageImage;

    /**
     * AI 生成的角色立绘 URL
     */
    @Column(columnDefinition = "TEXT")
    private String characterImage;

    /**
     * 角色名称
     */
    @Column(length = 100)
    private String characterName;

    /**
     * 角色档案故事
     */
    @Column(columnDefinition = "TEXT")
    private String characterStory;

    /**
     * 作品状态
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private WorkStatus status;

    /**
     * 错误信息（如果失败）
     */
    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = WorkStatus.GENERATING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
