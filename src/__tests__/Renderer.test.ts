import {
  getTileColor,
  getZoneColor,
  getObjectColor,
  getStaffColor
} from '../game/Renderer';
import { TileType, ZoneType, ObjectType, StaffType } from '../game/types';
import { TILE_COLORS, ZONE_COLORS, ENTITY_COLORS } from '../game/constants';

describe('Renderer', () => {
  describe('getTileColor', () => {
    it('returns correct color for EMPTY', () => {
      expect(getTileColor(TileType.EMPTY)).toBe(TILE_COLORS[TileType.EMPTY]);
    });

    it('returns correct color for FLOOR', () => {
      expect(getTileColor(TileType.FLOOR)).toBe(TILE_COLORS[TileType.FLOOR]);
    });

    it('returns correct color for WALL', () => {
      expect(getTileColor(TileType.WALL)).toBe(TILE_COLORS[TileType.WALL]);
    });

    it('returns correct color for DOOR', () => {
      expect(getTileColor(TileType.DOOR)).toBe(TILE_COLORS[TileType.DOOR]);
    });

    it('returns correct color for GRASS', () => {
      expect(getTileColor(TileType.GRASS)).toBe(TILE_COLORS[TileType.GRASS]);
    });

    it('returns default for unknown type', () => {
      expect(getTileColor('UNKNOWN' as TileType)).toBe('#1a1a2a');
    });
  });

  describe('getZoneColor', () => {
    it('returns transparent for NONE', () => {
      expect(getZoneColor(ZoneType.NONE)).toBe('transparent');
    });

    it('returns correct color for CELL', () => {
      expect(getZoneColor(ZoneType.CELL)).toBe(ZONE_COLORS[ZoneType.CELL]);
    });

    it('returns correct color for CANTEEN', () => {
      expect(getZoneColor(ZoneType.CANTEEN)).toBe(ZONE_COLORS[ZoneType.CANTEEN]);
    });

    it('returns correct color for KITCHEN', () => {
      expect(getZoneColor(ZoneType.KITCHEN)).toBe(ZONE_COLORS[ZoneType.KITCHEN]);
    });

    it('returns correct color for YARD', () => {
      expect(getZoneColor(ZoneType.YARD)).toBe(ZONE_COLORS[ZoneType.YARD]);
    });

    it('returns correct color for SHOWER', () => {
      expect(getZoneColor(ZoneType.SHOWER)).toBe(ZONE_COLORS[ZoneType.SHOWER]);
    });
  });

  describe('getObjectColor', () => {
    it('returns transparent for NONE', () => {
      expect(getObjectColor(ObjectType.NONE)).toBe('transparent');
    });

    it('returns color for BED', () => {
      expect(getObjectColor(ObjectType.BED)).toBe('#5a4a3a');
    });

    it('returns color for TOILET', () => {
      expect(getObjectColor(ObjectType.TOILET)).toBe('#6a6a7a');
    });

    it('returns color for TABLE', () => {
      expect(getObjectColor(ObjectType.TABLE)).toBe('#4a3a2a');
    });

    it('returns color for COOKER', () => {
      expect(getObjectColor(ObjectType.COOKER)).toBe('#3a3a4a');
    });

    it('returns color for TV', () => {
      expect(getObjectColor(ObjectType.TV)).toBe('#2a2a3a');
    });
  });

  describe('getStaffColor', () => {
    it('returns correct color for GUARD', () => {
      expect(getStaffColor(StaffType.GUARD)).toBe(ENTITY_COLORS.guard);
    });

    it('returns correct color for COOK', () => {
      expect(getStaffColor(StaffType.COOK)).toBe(ENTITY_COLORS.cook);
    });

    it('returns correct color for JANITOR', () => {
      expect(getStaffColor(StaffType.JANITOR)).toBe(ENTITY_COLORS.janitor);
    });
  });
});
