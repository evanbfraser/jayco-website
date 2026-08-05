/* Jayco — per-floorplan feature flags.
 *
 * PROVENANCE: harvested 2026-08-03 from jayco.com's own floorplan filter, which is
 * server-rendered but region-gated:
 *   1. GET  /rvs/floorplans/          -> cookies + <meta name="csrf-token">
 *   2. POST /rvs/setregion/  r=1      -> sets the region cookie
 *   3. GET  /rvs/floorplans/?RvFloorplanSearch[<key>]=1&page=N&per-page=12
 * Membership of a key IS Jayco's published answer for that key — not an inference
 * from plan codes. Re-running the harvest is ~200 requests.
 *
 * Jayco exposes 28 feature keys; 11 return zero rows sitewide (front_kitchen,
 * mid_bunkhouse, bathrooms, rear_bath, murphy_bed, tri_fold, awnings, washer_dryer,
 * dishwasher, legless_dinette, loft). Their columns are empty in Jayco's own data, so
 * they are omitted here rather than shipped as chips that can never match.
 *
 * COVERAGE: 161 of 181 floorplans carry at least one flag. The 20 without one
 * are plans Jayco no longer lists; an absent flag on a LISTED plan is a published no.
 *
 * THE ONE INFERENCE: 23 rows have no page of their own on jayco.com and inherit
 * their sibling plan's flags (Jay Flight W regional twins, plus greyhawk 30Z-CSA).
 * They are the same layout at a different regional trim. Listed here so it stays visible:
 *   greyhawk__30z-csa
 *   jay-flight__130bhw
 *   jay-flight__140tbw
 *   jay-flight__170bhw
 *   jay-flight__170fqw
 *   jay-flight__172dbw
 *   jay-flight__175bhw
 *   jay-flight__175fqw
 *   jay-flight__178dbsw
 *   jay-flight__250bhw
 *   jay-flight__180lkw
 *   jay-flight__197mbw
 *   jay-flight__210qbw
 *   jay-flight__260bhw
 *   jay-flight__200mksw
 *   jay-flight__245bhsw
 *   jay-flight__261bhsw
 *   jay-flight__262rlsw
 *   jay-flight__265mwsw
 *   jay-flight__225mlsw
 *   jay-flight__263bhsw
 *   jay-flight__270bhsw
 *   jay-flight__280bhsw
 */
window.JAYCO_FEATURES = {
  harvested: '2026-08-03',
  labels: {
    outside_kitchen: 'Outside kitchen',
    bunkhouse: 'Bunkhouse',
    outside_entertainment: 'Outside entertainment',
    front_living_room: 'Front living room',
    fireplace: 'Fireplace',
    king_bed: 'King bed',
    couples_coach: 'Couple\'s coach',
    washer_dryer_prep: 'Washer/dryer prep',
    smart_rv_system: 'Smart RV system',
    residential_refrigerator: 'Residential fridge',
    kitchen_island: 'Kitchen island',
    kitchen_pantry: 'Kitchen pantry',
    pass_through_storage: 'Pass-through storage',
    hide_a_bed: 'Hide-a-bed',
    theater_seating: 'Theater seating',
    free_standing_table: 'Free-standing table',
    booth_dinette: 'Booth dinette',
  },
  groups: [
    { name: 'Layout', keys: ['bunkhouse', 'front_living_room', 'couples_coach', 'pass_through_storage'] },
    { name: 'Kitchen', keys: ['outside_kitchen', 'kitchen_island', 'kitchen_pantry', 'residential_refrigerator'] },
    { name: 'Living', keys: ['fireplace', 'theater_seating', 'hide_a_bed', 'booth_dinette', 'free_standing_table', 'outside_entertainment'] },
    { name: 'Sleeping & utility', keys: ['king_bed', 'washer_dryer_prep', 'smart_rv_system'] },
  ],
  /* keyed by the compare-page row key: modelId + '__' + floorplan id */
  plans: {
    'alante__27a': ['booth_dinette', 'couples_coach', 'front_living_room', 'hide_a_bed', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage'],
    'alante__29s': ['booth_dinette', 'couples_coach', 'front_living_room', 'kitchen_pantry', 'outside_entertainment', 'outside_kitchen', 'pass_through_storage', 'theater_seating'],
    'alante__29f': ['booth_dinette', 'bunkhouse', 'front_living_room', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage'],
    'comet__18c': ['couples_coach', 'smart_rv_system'],
    'eagle-fw__29ddb': ['booth_dinette', 'bunkhouse', 'outside_kitchen', 'theater_seating', 'washer_dryer_prep'],
    'eagle-fw__29rlc': ['booth_dinette', 'couples_coach', 'fireplace', 'free_standing_table', 'kitchen_island', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage', 'theater_seating', 'washer_dryer_prep'],
    'eagle-fw__31qbh': ['booth_dinette', 'bunkhouse', 'outside_kitchen', 'theater_seating', 'washer_dryer_prep'],
    'eagle-fw__31rlt': ['booth_dinette', 'couples_coach', 'fireplace', 'free_standing_table', 'kitchen_island', 'kitchen_pantry', 'outside_kitchen', 'theater_seating'],
    'eagle-fw__321rsts': ['booth_dinette', 'couples_coach', 'fireplace', 'free_standing_table', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'outside_kitchen', 'theater_seating', 'washer_dryer_prep'],
    'eagle-fw__335lsts': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_pantry', 'outside_kitchen', 'theater_seating', 'washer_dryer_prep'],
    'eagle-fw__365ukts': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_pantry', 'outside_kitchen', 'washer_dryer_prep'],
    'eagle-fw__367tbts': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage', 'theater_seating', 'washer_dryer_prep'],
    'eagle-fw__360dbok': ['booth_dinette', 'fireplace', 'free_standing_table', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage', 'theater_seating', 'washer_dryer_prep'],
    'eagle-fw__355mbqs': ['booth_dinette', 'couples_coach', 'fireplace', 'free_standing_table', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'outside_kitchen', 'theater_seating', 'washer_dryer_prep'],
    'eagle-sle-fw__28bhu': ['booth_dinette', 'bunkhouse', 'free_standing_table'],
    'eagle-sle-fw__30rlt': ['booth_dinette', 'couples_coach', 'fireplace', 'free_standing_table', 'kitchen_island', 'kitchen_pantry', 'theater_seating'],
    'eagle-tt__230mlcs': ['booth_dinette', 'couples_coach', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage', 'theater_seating'],
    'eagle-tt__265fkds': ['couples_coach', 'front_living_room', 'king_bed', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage', 'theater_seating', 'washer_dryer_prep'],
    'eagle-tt__294ckbs': ['booth_dinette', 'couples_coach', 'fireplace', 'free_standing_table', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'pass_through_storage', 'theater_seating'],
    'eagle-tt__312bhok': ['booth_dinette', 'bunkhouse', 'fireplace', 'free_standing_table', 'kitchen_island', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage', 'washer_dryer_prep'],
    'greyhawk__27u': ['booth_dinette', 'couples_coach', 'front_living_room', 'hide_a_bed', 'king_bed', 'kitchen_pantry', 'theater_seating'],
    'greyhawk__29mv': ['booth_dinette', 'couples_coach', 'kitchen_pantry', 'smart_rv_system', 'theater_seating'],
    'greyhawk__31f': ['booth_dinette', 'bunkhouse', 'front_living_room', 'kitchen_pantry', 'theater_seating'],
    'greyhawk__30z': ['booth_dinette', 'couples_coach', 'front_living_room', 'hide_a_bed', 'kitchen_pantry', 'theater_seating'],
    'greyhawk__30z-csa': ['booth_dinette', 'couples_coach', 'front_living_room', 'hide_a_bed', 'kitchen_pantry', 'theater_seating'],
    'greyhawk-xl__32u': ['booth_dinette', 'couples_coach', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'smart_rv_system', 'theater_seating'],
    'greyhawk-xl__33f': ['booth_dinette', 'bunkhouse', 'kitchen_pantry', 'outside_entertainment', 'smart_rv_system', 'theater_seating'],
    'jay-feather__18rbf': ['couples_coach', 'fireplace', 'kitchen_pantry', 'pass_through_storage'],
    'jay-feather__19mrk': ['couples_coach', 'fireplace', 'front_living_room', 'pass_through_storage', 'theater_seating'],
    'jay-feather__21mml': ['booth_dinette', 'couples_coach', 'front_living_room', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage', 'theater_seating'],
    'jay-feather__21mbh': ['booth_dinette', 'bunkhouse', 'couples_coach', 'front_living_room', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-feather__23rk': ['booth_dinette', 'couples_coach', 'kitchen_pantry', 'pass_through_storage', 'theater_seating'],
    'jay-feather__25rb': ['booth_dinette', 'couples_coach', 'fireplace', 'free_standing_table', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-feather__23mbd': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage'],
    'jay-feather__24fk': ['couples_coach', 'fireplace', 'kitchen_pantry', 'pass_through_storage', 'theater_seating'],
    'jay-feather__27bh': ['booth_dinette', 'bunkhouse', 'fireplace', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-feather__29bhb': ['booth_dinette', 'bunkhouse', 'fireplace', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-feather__27mk': ['booth_dinette', 'couples_coach', 'fireplace', 'kitchen_island', 'pass_through_storage'],
    'jay-feather__26fk': ['booth_dinette', 'couples_coach', 'fireplace', 'free_standing_table', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage', 'theater_seating', 'washer_dryer_prep'],
    'jay-feather__30rkb': ['booth_dinette', 'couples_coach', 'fireplace', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage', 'washer_dryer_prep'],
    'jay-feather__29qbh': ['booth_dinette', 'bunkhouse', 'fireplace', 'free_standing_table', 'outside_kitchen', 'pass_through_storage'],
    'jay-feather__33bh': ['booth_dinette', 'bunkhouse', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-feather-air__15mrb': ['booth_dinette', 'couples_coach', 'hide_a_bed', 'outside_kitchen', 'pass_through_storage'],
    'jay-feather-air__16db': ['booth_dinette', 'bunkhouse', 'couples_coach', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-feather-air__16rb': ['couples_coach', 'hide_a_bed', 'outside_kitchen', 'pass_through_storage'],
    'jay-feather-air__19mbs': ['booth_dinette', 'bunkhouse', 'front_living_room', 'hide_a_bed', 'outside_kitchen'],
    'jay-feather-air__18fbs': ['couples_coach', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage'],
    'jay-feather-air-sl__15tbsl': ['booth_dinette', 'couples_coach'],
    'jay-feather-air-sl__17bhsl': ['booth_dinette', 'bunkhouse'],
    'jay-feather-air-sl__17rbsl': ['couples_coach', 'hide_a_bed'],
    'jay-feather-sl__25rlsl': ['booth_dinette', 'couples_coach', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage'],
    'jay-feather-sl__26bhsl': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__130bh': ['bunkhouse', 'couples_coach', 'fireplace'],
    'jay-flight__140tb': ['booth_dinette', 'couples_coach'],
    'jay-flight__170bh': ['booth_dinette', 'bunkhouse', 'couples_coach'],
    'jay-flight__170fq': ['booth_dinette', 'couples_coach'],
    'jay-flight__130bhw': ['bunkhouse', 'couples_coach', 'fireplace'],
    'jay-flight__140tbw': ['booth_dinette', 'couples_coach'],
    'jay-flight__172db': ['booth_dinette', 'bunkhouse', 'couples_coach', 'kitchen_pantry'],
    'jay-flight__170bhw': ['booth_dinette', 'bunkhouse', 'couples_coach'],
    'jay-flight__170fqw': ['booth_dinette', 'couples_coach'],
    'jay-flight__172dbw': ['booth_dinette', 'bunkhouse', 'couples_coach', 'kitchen_pantry'],
    'jay-flight__175bh': ['booth_dinette', 'bunkhouse'],
    'jay-flight__175fq': ['booth_dinette', 'couples_coach'],
    'jay-flight__178dbs': ['booth_dinette', 'bunkhouse', 'couples_coach', 'kitchen_pantry', 'pass_through_storage'],
    'jay-flight__250bh': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'pass_through_storage'],
    'jay-flight__175bhw': ['booth_dinette', 'bunkhouse'],
    'jay-flight__175fqw': ['booth_dinette', 'couples_coach'],
    'jay-flight__178dbsw': ['booth_dinette', 'bunkhouse', 'couples_coach', 'kitchen_pantry', 'pass_through_storage'],
    'jay-flight__250bhw': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'pass_through_storage'],
    'jay-flight__180lk': ['couples_coach', 'free_standing_table', 'hide_a_bed'],
    'jay-flight__197mb': ['booth_dinette', 'bunkhouse', 'front_living_room', 'hide_a_bed'],
    'jay-flight__180lkw': ['couples_coach', 'free_standing_table', 'hide_a_bed'],
    'jay-flight__197mbw': ['booth_dinette', 'bunkhouse', 'front_living_room', 'hide_a_bed'],
    'jay-flight__210qb': ['booth_dinette', 'couples_coach', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage'],
    'jay-flight__260bh': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'pass_through_storage'],
    'jay-flight__270bhs': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage'],
    'jay-flight__210qbw': ['booth_dinette', 'couples_coach', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage'],
    'jay-flight__260bhw': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'pass_through_storage'],
    'jay-flight__211mbw': ['booth_dinette', 'bunkhouse', 'front_living_room', 'hide_a_bed', 'pass_through_storage'],
    'jay-flight__200mks': ['couples_coach', 'theater_seating'],
    'jay-flight__245bhs': ['booth_dinette', 'bunkhouse', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__261bhs': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__262rls': ['booth_dinette', 'couples_coach', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage'],
    'jay-flight__200mksw': ['couples_coach', 'theater_seating'],
    'jay-flight__265mws': ['booth_dinette', 'couples_coach', 'hide_a_bed', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__225mls': ['booth_dinette', 'couples_coach', 'kitchen_pantry', 'pass_through_storage', 'theater_seating'],
    'jay-flight__263bhs': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__245bhsw': ['booth_dinette', 'bunkhouse', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__265th': ['couples_coach', 'free_standing_table', 'hide_a_bed', 'pass_through_storage'],
    'jay-flight__261bhsw': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__262rlsw': ['booth_dinette', 'couples_coach', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage'],
    'jay-flight__265mwsw': ['booth_dinette', 'couples_coach', 'hide_a_bed', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__225mlsw': ['booth_dinette', 'couples_coach', 'kitchen_pantry', 'pass_through_storage', 'theater_seating'],
    'jay-flight__263bhsw': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__280bhs': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__330tbs': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__295tbs': ['booth_dinette', 'bunkhouse', 'couples_coach', 'kitchen_pantry', 'outside_kitchen'],
    'jay-flight__321bds': ['booth_dinette', 'bunkhouse', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__290rls': ['booth_dinette', 'couples_coach', 'hide_a_bed', 'kitchen_island', 'kitchen_pantry', 'pass_through_storage', 'theater_seating'],
    'jay-flight__325bht': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'king_bed', 'outside_kitchen', 'pass_through_storage', 'washer_dryer_prep'],
    'jay-flight__380dqs': ['booth_dinette', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage', 'washer_dryer_prep'],
    'jay-flight__333bts': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'kitchen_island', 'kitchen_pantry', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__334rts': ['booth_dinette', 'couples_coach', 'kitchen_island', 'kitchen_pantry', 'pass_through_storage', 'theater_seating', 'washer_dryer_prep'],
    'jay-flight__270bhsw': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'kitchen_pantry', 'pass_through_storage'],
    'jay-flight__270mks': ['booth_dinette', 'couples_coach', 'kitchen_island', 'kitchen_pantry', 'pass_through_storage', 'theater_seating', 'washer_dryer_prep'],
    'jay-flight__280bhsw': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'outside_kitchen', 'pass_through_storage'],
    'jay-flight__335bhs': ['booth_dinette', 'bunkhouse', 'hide_a_bed', 'pass_through_storage'],
    'jay-flight-bungalow__401flts': ['couples_coach', 'fireplace', 'free_standing_table', 'front_living_room', 'kitchen_island', 'kitchen_pantry', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'jay-flight-bungalow__401loft': ['bunkhouse', 'fireplace', 'free_standing_table', 'front_living_room', 'kitchen_island', 'kitchen_pantry', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'jay-flight-bungalow__404loft': ['bunkhouse', 'fireplace', 'free_standing_table', 'kitchen_pantry', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'jay-flight-bungalow__402dlft': ['bunkhouse', 'couples_coach', 'fireplace', 'free_standing_table', 'hide_a_bed', 'kitchen_island', 'kitchen_pantry', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'jay-flight-bungalow__402rlts': ['couples_coach', 'fireplace', 'free_standing_table', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'jay-flight-bungalow__jayloft': ['bunkhouse', 'fireplace', 'hide_a_bed', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'north-point__310rlts': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'theater_seating', 'washer_dryer_prep'],
    'north-point__365rkts': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_pantry', 'residential_refrigerator', 'theater_seating', 'washer_dryer_prep'],
    'north-point__380fbrk': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_pantry', 'pass_through_storage', 'residential_refrigerator', 'theater_seating', 'washer_dryer_prep'],
    'pinnacle__32rlts': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'residential_refrigerator', 'theater_seating', 'washer_dryer_prep'],
    'pinnacle__36fbts': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'theater_seating', 'washer_dryer_prep'],
    'pinnacle__38fbrk': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'theater_seating', 'washer_dryer_prep'],
    'pinnacle__38ssws': ['couples_coach', 'fireplace', 'hide_a_bed', 'king_bed', 'kitchen_island', 'outside_entertainment', 'residential_refrigerator', 'theater_seating', 'washer_dryer_prep'],
    'pinnacle__39flok': ['couples_coach', 'fireplace', 'front_living_room', 'king_bed', 'kitchen_island', 'kitchen_pantry', 'outside_entertainment', 'outside_kitchen', 'pass_through_storage', 'residential_refrigerator', 'theater_seating', 'washer_dryer_prep'],
    'precept__31ul': ['booth_dinette', 'couples_coach', 'hide_a_bed', 'king_bed', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'theater_seating'],
    'precept__34b': ['booth_dinette', 'couples_coach', 'fireplace', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'washer_dryer_prep'],
    'precept__34g': ['booth_dinette', 'couples_coach', 'fireplace', 'king_bed', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'precept__36a': ['booth_dinette', 'bunkhouse', 'king_bed', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'precept__36c': ['booth_dinette', 'couples_coach', 'fireplace', 'hide_a_bed', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'precept-prestige__36u': ['booth_dinette', 'couples_coach', 'fireplace', 'king_bed', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'washer_dryer_prep'],
    'precept-prestige__36b': ['booth_dinette', 'bunkhouse', 'fireplace', 'free_standing_table', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'precept-prestige__36h': ['booth_dinette', 'fireplace', 'hide_a_bed', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'redhawk__24b': ['booth_dinette', 'couples_coach', 'kitchen_pantry', 'smart_rv_system', 'theater_seating'],
    'redhawk__26m': ['booth_dinette', 'couples_coach', 'fireplace', 'hide_a_bed', 'kitchen_pantry', 'outside_kitchen', 'smart_rv_system', 'theater_seating'],
    'redhawk-se__20lf': ['kitchen_pantry'],
    'redhawk-se__22e': ['booth_dinette', 'couples_coach'],
    'redhawk-se__22ef': ['booth_dinette', 'couples_coach'],
    'redhawk-se__22t': ['couples_coach', 'king_bed', 'pass_through_storage'],
    'redhawk-se__22tf': ['couples_coach', 'king_bed', 'pass_through_storage'],
    'redhawk-se__22a': ['booth_dinette', 'couples_coach', 'kitchen_pantry'],
    'redhawk-se__22af': ['booth_dinette', 'couples_coach', 'kitchen_pantry'],
    'redhawk-se__22c': ['booth_dinette', 'couples_coach', 'kitchen_pantry'],
    'redhawk-se__22cf': ['booth_dinette', 'couples_coach', 'kitchen_pantry'],
    'redhawk-se__31ff': ['booth_dinette', 'bunkhouse', 'kitchen_pantry'],
    'seismic-fw__359': ['couples_coach', 'fireplace', 'free_standing_table', 'hide_a_bed', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'smart_rv_system', 'washer_dryer_prep'],
    'seismic-fw__399': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_pantry', 'theater_seating', 'washer_dryer_prep'],
    'seismic-fw__395': ['couples_coach', 'fireplace', 'king_bed', 'kitchen_pantry', 'theater_seating', 'washer_dryer_prep'],
    'seismic-fw__413': ['couples_coach', 'fireplace', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage'],
    'seismic-tt__214': ['couples_coach', 'king_bed'],
    'seismic-tt__265': ['couples_coach', 'king_bed', 'kitchen_pantry', 'outside_kitchen'],
    'seismic-tt__286': ['couples_coach', 'king_bed', 'kitchen_pantry', 'outside_kitchen'],
    'seneca__37k': ['booth_dinette', 'couples_coach', 'fireplace', 'free_standing_table', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'washer_dryer_prep'],
    'seneca__37l': ['booth_dinette', 'bunkhouse', 'fireplace', 'hide_a_bed', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'seneca__37m': ['booth_dinette', 'couples_coach', 'fireplace', 'free_standing_table', 'hide_a_bed', 'king_bed', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'seneca-prestige__37k': ['booth_dinette', 'couples_coach', 'fireplace', 'king_bed', 'outside_entertainment'],
    'seneca-prestige__37l': ['bunkhouse', 'couples_coach', 'fireplace', 'front_living_room', 'outside_entertainment', 'residential_refrigerator', 'smart_rv_system', 'washer_dryer_prep'],
    'seneca-prestige__37m': ['couples_coach', 'fireplace', 'residential_refrigerator', 'washer_dryer_prep'],
    'seneca-xt__32u': ['booth_dinette', 'couples_coach', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'theater_seating'],
    'seneca-xt__35l': ['booth_dinette', 'fireplace', 'hide_a_bed', 'king_bed', 'kitchen_pantry', 'outside_entertainment', 'pass_through_storage', 'residential_refrigerator', 'smart_rv_system', 'theater_seating', 'washer_dryer_prep'],
    'swift__20e': ['couples_coach', 'smart_rv_system'],
    'swift__20t': ['couples_coach', 'smart_rv_system'],
    'terrain__19ag': ['couples_coach', 'front_living_room', 'smart_rv_system'],
    'terrain__19a': ['couples_coach', 'front_living_room', 'smart_rv_system'],
  },
};
