package com.junkiverse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 生成角色请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateRequest {

    /**
     * 拼贴图片（Base64）
     */
    private String collageImage;

    /**
     * 部件列表
     */
    private List<Part> parts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Part {
        /**
         * 部件名称（如：瓶盖、纽扣）
         */
        private String name;

        /**
         * X 坐标
         */
        private Double x;

        /**
         * Y 坐标
         */
        private Double y;

        /**
         * 旋转角度
         */
        private Double rotation;

        /**
         * 缩放比例
         */
        private Double scale;

        /**
         * Z 轴顺序（图层）
         */
        private Integer zIndex;
    }
}
