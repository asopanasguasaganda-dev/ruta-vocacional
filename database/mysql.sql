-- Ruta Vocacional 360. MySQL 8 / MariaDB 10.6+. No demo accounts.
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL,
  `institutionId` VARCHAR(191),
  `groupName` VARCHAR(191) NOT NULL DEFAULT '',
  `status` VARCHAR(191) NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id`),
  UNIQUE (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `institutions` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `sessions` (
  `token` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `expires` BIGINT NOT NULL,
  PRIMARY KEY (`token`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `documents` (
  `owner` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` LONGTEXT NOT NULL,
  `revision` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`owner`,`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `submissions` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `instrument_id` VARCHAR(191) NOT NULL,
  `version` VARCHAR(191) NOT NULL,
  `answers` LONGTEXT NOT NULL,
  `scores` LONGTEXT NOT NULL,
  `snapshot` LONGTEXT NOT NULL,
  `created_at` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `assessment_attempts` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `instrument_id` VARCHAR(191) NOT NULL,
  `stable_id` VARCHAR(191) NOT NULL,
  `snapshot` LONGTEXT NOT NULL,
  `started_at` VARCHAR(191) NOT NULL,
  `state` VARCHAR(191) NOT NULL,
  `submission_id` VARCHAR(191),
  `answers` LONGTEXT NOT NULL DEFAULT ('{}'),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  `active_guard` TINYINT GENERATED ALWAYS AS (CASE WHEN state='in_progress' THEN 1 ELSE NULL END) STORED,
  UNIQUE (`user_id`,`instrument_id`,`active_guard`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `assessment_results` (
  `submission_id` VARCHAR(191) NOT NULL,
  `revision` INT NOT NULL,
  `result` LONGTEXT NOT NULL,
  `reviews` LONGTEXT,
  `reviewer` VARCHAR(191),
  `created_at` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`submission_id`,`revision`),
  FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `released_results` (
  `submission_id` VARCHAR(191) NOT NULL,
  `released_by` VARCHAR(191) NOT NULL,
  `released_at` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`submission_id`),
  FOREIGN KEY (`released_by`) REFERENCES `users` (`id`),
  FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `resets` (
  `token` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `expires` BIGINT NOT NULL,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `attempts` (
  `key` VARCHAR(191) NOT NULL,
  `count` INT NOT NULL,
  `until` BIGINT NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `academic_catalog_versions` (
  `version` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `actor` VARCHAR(191) NOT NULL,
  `created_at` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `guidance_reports` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `institution_id` VARCHAR(191),
  `digest` VARCHAR(191) NOT NULL,
  `version` INT NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `created_at` VARCHAR(191) NOT NULL,
  `updated_at` VARCHAR(191) NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `content` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE (`user_id`,`digest`,`version`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `orientation_reports` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `institution_id` VARCHAR(191),
  `created_at` VARCHAR(191) NOT NULL,
  `shared` INT NOT NULL,
  `digest` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE (`user_id`,`digest`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `training_mutations` (
  `id` VARCHAR(191) NOT NULL,
  `result` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `training_entities` (
  `id` VARCHAR(191) NOT NULL,
  `version` INT NOT NULL,
  `org` VARCHAR(191) NOT NULL,
  `kind` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `revision` INT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `created_at` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`,`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `training_enrollments` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `course_id` VARCHAR(191) NOT NULL,
  `course_version` INT NOT NULL,
  `snapshot` LONGTEXT NOT NULL,
  `origin` VARCHAR(191) NOT NULL,
  `created_at` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE (`user_id`,`course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `training_completions` (
  `enrollment_id` VARCHAR(191) NOT NULL,
  `activity_id` VARCHAR(191) NOT NULL,
  `evidence` LONGTEXT NOT NULL,
  `completed_at` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`enrollment_id`,`activity_id`),
  FOREIGN KEY (`enrollment_id`) REFERENCES `training_enrollments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `training_attempts` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `enrollment_id` VARCHAR(191) NOT NULL,
  `activity_id` VARCHAR(191) NOT NULL,
  `mode` VARCHAR(191) NOT NULL,
  `snapshot` LONGTEXT NOT NULL,
  `answers` LONGTEXT NOT NULL DEFAULT ('{}'),
  `flags` LONGTEXT NOT NULL DEFAULT ('[]'),
  `revision` INT NOT NULL DEFAULT 0,
  `state` VARCHAR(191) NOT NULL,
  `started_at` VARCHAR(191) NOT NULL,
  `expires_at` VARCHAR(191),
  `closed_at` VARCHAR(191),
  `error` LONGTEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`enrollment_id`) REFERENCES `training_enrollments` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  `active_guard` TINYINT GENERATED ALWAYS AS (CASE WHEN state IN ('in_progress','recoverable') THEN 1 ELSE NULL END) STORED,
  UNIQUE (`user_id`,`enrollment_id`,`activity_id`,`mode`,`active_guard`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `training_results` (
  `attempt_id` VARCHAR(191) NOT NULL,
  `revision` INT NOT NULL,
  `result` LONGTEXT NOT NULL,
  `reviews` LONGTEXT NOT NULL,
  `reason` VARCHAR(191) NOT NULL,
  `created_at` VARCHAR(191) NOT NULL,
  `reviewer` VARCHAR(191),
  PRIMARY KEY (`attempt_id`,`revision`),
  FOREIGN KEY (`attempt_id`) REFERENCES `training_attempts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `training_feedback` (
  `attempt_id` VARCHAR(191) NOT NULL,
  `question_id` VARCHAR(191) NOT NULL,
  `sequence` INT NOT NULL,
  `answer` LONGTEXT NOT NULL,
  `created_at` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`attempt_id`,`question_id`,`sequence`),
  FOREIGN KEY (`attempt_id`) REFERENCES `training_attempts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `training_audit` (
  `id` VARCHAR(191) NOT NULL,
  `org` VARCHAR(191) NOT NULL,
  `actor` VARCHAR(191) NOT NULL,
  `action` VARCHAR(191) NOT NULL,
  `entity` VARCHAR(191) NOT NULL,
  `detail` LONGTEXT NOT NULL,
  `created_at` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
