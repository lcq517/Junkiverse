package com.junkiverse.repository;

import com.junkiverse.entity.Work;
import com.junkiverse.entity.WorkStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 作品 Repository
 */
@Repository
public interface WorkRepository extends JpaRepository<Work, Long> {

    /**
     * 根据状态查询作品列表
     */
    List<Work> findByStatus(WorkStatus status);

    /**
     * 查询最近的作品
     */
    List<Work> findTop10ByOrderByCreatedAtDesc();
}
