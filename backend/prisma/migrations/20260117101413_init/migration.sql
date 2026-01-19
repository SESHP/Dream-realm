-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "x" INTEGER NOT NULL DEFAULT 0,
    "y" INTEGER NOT NULL DEFAULT 0,
    "current_zone" TEXT NOT NULL DEFAULT 'shelter',
    "current_action" TEXT,
    "action_started_at" TIMESTAMP(3),
    "action_target_id" TEXT,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventories" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "nightmare_shards" INTEGER NOT NULL DEFAULT 0,
    "frozen_wishes" INTEGER NOT NULL DEFAULT 0,
    "oblivion_essence" INTEGER NOT NULL DEFAULT 0,
    "pure_fear" INTEGER NOT NULL DEFAULT 0,
    "moon_dust" INTEGER NOT NULL DEFAULT 0,
    "max_capacity" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nightmare_shards" INTEGER NOT NULL DEFAULT 0,
    "frozen_wishes" INTEGER NOT NULL DEFAULT 0,
    "oblivion_essence" INTEGER NOT NULL DEFAULT 0,
    "pure_fear" INTEGER NOT NULL DEFAULT 0,
    "moon_dust" INTEGER NOT NULL DEFAULT 0,
    "max_storage" INTEGER NOT NULL DEFAULT 500,
    "last_collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "villages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "village_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "position_x" INTEGER NOT NULL,
    "position_y" INTEGER NOT NULL,
    "construction_started_at" TIMESTAMP(3),
    "construction_ends_at" TIMESTAMP(3),
    "is_constructing" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_resources" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "depleted" BOOLEAN NOT NULL DEFAULT false,
    "respawn_at" TIMESTAMP(3),

    CONSTRAINT "map_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "characters_user_id_key" ON "characters"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventories_character_id_key" ON "inventories"("character_id");

-- CreateIndex
CREATE UNIQUE INDEX "villages_user_id_key" ON "villages"("user_id");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villages" ADD CONSTRAINT "villages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
