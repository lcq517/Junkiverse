package com.junkiverse.service;

import com.junkiverse.dto.GenerateRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Random;

/**
 * AI API 服务（Mock 实现）
 *
 * TODO: 后续接入真实的 AI API
 */
@Service
@Slf4j
public class AiApiService {

    private final Random random = new Random();

    /**
     * 生成角色立绘
     *
     * @param collageImage 拼贴图片（Base64）
     * @param parts 部件列表
     * @return AI 生成的角色立绘 URL（Mock 返回占位图）
     */
    public String generateCharacterImage(String collageImage, GenerateRequest.Part[] parts) {
        log.info("开始生成角色立绘，部件数量：{}", parts.length);

        // TODO: 调用真实的 AI 绘画 API
        // 模拟处理时间
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Mock 返回一个占位图 URL
        String placeholderUrl = "https://via.placeholder.com/400x600/4CAF50/FFFFFF?text=Character+Image";
        log.info("角色立绘生成完成：{}", placeholderUrl);
        return placeholderUrl;
    }

    /**
     * 生成角色档案故事
     *
     * @param characterName 角色名称
     * @param parts 部件列表
     * @return AI 生成的故事文本
     */
    public String generateCharacterStory(String characterName, GenerateRequest.Part[] parts) {
        log.info("开始生成角色故事，角色名：{}", characterName);

        // TODO: 调用真实的 AI 文本生成 API
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Mock 生成一个有趣的故事
        String[] personalities = {"热情似火", "冷静沉稳", "神秘莫测", "活泼可爱", "高冷傲娇"};
        String[] occupations = {"环保卫士", "美食猎人", "时间旅者", "梦境守护者", "星际漫游者"};
        String[] catchphrases = {"废物也能发光！", "拼凑的力量！", "我是最特别的！", "废物改造，永不止步！"};

        String personality = personalities[random.nextInt(personalities.length)];
        String occupation = occupations[random.nextInt(occupations.length)];
        String catchphrase = catchphrases[random.nextInt(catchphrases.length)];

        String story = String.format(
            "【废物星人档案 #%d】\n\n" +
            "姓名：%s\n" +
            "性格：%s\n" +
            "职业：%s\n\n" +
            "诞生于一个平凡的午后，被主人从垃圾桶边缘拯救回来。从此立志要证明：即使是废物，也有独一无二的价值！\n\n" +
            "口头禅：%s",
            random.nextInt(9000) + 1000,
            characterName,
            personality,
            occupation,
            catchphrase
        );

        log.info("角色故事生成完成，字数：{}", story.length());
        return story;
    }

    /**
     * 根据部件生成随机角色名
     */
    public String generateCharacterName(GenerateRequest.Part[] parts) {
        String[] prefixes = {"瓶", "盖", "纽", "扣", "发", "绳", "纸", "盒"};
        String[] suffixes = {"侠", "怪", "人", "星", "灵", "王", "神", "王"};

        StringBuilder name = new StringBuilder();
        for (GenerateRequest.Part part : parts) {
            if (part.getName() != null && !part.getName().isEmpty()) {
                String partName = part.getName();
                // 取第一个字符
                if (partName.length() > 0) {
                    name.append(partName.charAt(0));
                    if (name.length() >= 2) break;
                }
            }
        }

        if (name.length() < 2) {
            name.append(prefixes[random.nextInt(prefixes.length)]);
        }

        name.append(suffixes[random.nextInt(suffixes.length)]);

        return name.toString();
    }
}
