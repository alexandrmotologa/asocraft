import type {
  LocalizedStoreMetadata,
  IosMetadata,
  AndroidMetadata,
} from "../../types/index.js";
import { countCharacters } from "../constraints/validator.js";
import { optimizeIosKeywords, calculateKeywordDensity } from "./keyword-optimizer.js";
import { IOS_LIMITS, ANDROID_LIMITS } from "../constraints/limits.js";

export interface FieldAuditScore {
  field: string;
  score: number;
  maxScore: number;
  length: number;
  maxLength: number;
  utilizationPercent: number;
  recommendations: string[];
}

export interface LocaleAuditReport {
  locale: string;
  platform: "ios" | "android" | "combined";
  overallScore: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  fieldScores: FieldAuditScore[];
  summary: string;
  recommendations: string[];
}

export function auditIosMetadata(
  metadata: IosMetadata,
  locale: string = "en-US"
): LocaleAuditReport {
  const fieldScores: FieldAuditScore[] = [];
  const recommendations: string[] = [];

  // 1. Title Audit (30 points)
  const titleLen = countCharacters(metadata.title);
  let titleScore = 0;
  const titleRecs: string[] = [];

  if (titleLen > IOS_LIMITS.title) {
    titleScore = 0;
    titleRecs.push(`Title exceeds limit by ${titleLen - IOS_LIMITS.title} characters. Store rejection risk!`);
  } else if (titleLen >= 24) {
    titleScore = 30;
  } else if (titleLen >= 18) {
    titleScore = 24;
    titleRecs.push(`Title uses ${titleLen}/${IOS_LIMITS.title} characters. Add 1-2 keywords after a colon to maximize ranking.`);
  } else {
    titleScore = 12;
    titleRecs.push(`Title is very short (${titleLen}/${IOS_LIMITS.title}). You are wasting high-impact keyword space.`);
  }

  fieldScores.push({
    field: "iOS Title",
    score: titleScore,
    maxScore: 30,
    length: titleLen,
    maxLength: IOS_LIMITS.title,
    utilizationPercent: Math.round((titleLen / IOS_LIMITS.title) * 100),
    recommendations: titleRecs,
  });

  // 2. Subtitle Audit (25 points)
  const subLen = countCharacters(metadata.subtitle);
  let subScore = 0;
  const subRecs: string[] = [];

  if (subLen > IOS_LIMITS.subtitle) {
    subScore = 0;
    subRecs.push(`Subtitle exceeds limit by ${subLen - IOS_LIMITS.subtitle} characters.`);
  } else if (subLen >= 26) {
    subScore = 25;
  } else if (subLen >= 20) {
    subScore = 20;
    subRecs.push(`Subtitle uses ${subLen}/${IOS_LIMITS.subtitle} characters. Expand with descriptive keywords.`);
  } else {
    subScore = 10;
    subRecs.push(`Subtitle is underutilized (${subLen}/${IOS_LIMITS.subtitle}). Subtitles carry high search weight.`);
  }

  fieldScores.push({
    field: "iOS Subtitle",
    score: subScore,
    maxScore: 25,
    length: subLen,
    maxLength: IOS_LIMITS.subtitle,
    utilizationPercent: Math.round((subLen / IOS_LIMITS.subtitle) * 100),
    recommendations: subRecs,
  });

  // 3. Keywords Audit (35 points)
  const kwLen = countCharacters(metadata.keywords);
  let kwScore = 0;
  const kwRecs: string[] = [];

  const opt = optimizeIosKeywords(metadata.keywords, {
    title: metadata.title,
    subtitle: metadata.subtitle,
    locale,
  });

  if (kwLen > IOS_LIMITS.keywords) {
    kwScore = 0;
    kwRecs.push(`Keywords exceed 100 characters limit (+${kwLen - IOS_LIMITS.keywords} overflow).`);
  } else {
    if (kwLen >= 90) kwScore = 35;
    else if (kwLen >= 75) kwScore = 30;
    else if (kwLen >= 60) kwScore = 22;
    else kwScore = 12;

    if (metadata.keywords.includes(", ")) {
      kwScore = Math.max(0, kwScore - 5);
      kwRecs.push("Remove spaces after commas to recover 15-20% extra character capacity.");
    }

    if (opt.removedDuplicates.length > 0) {
      kwScore = Math.max(0, kwScore - 5);
      kwRecs.push(`Keywords contain duplicate words: ${opt.removedDuplicates.join(", ")}.`);
    }

    if (opt.removedOverlapWithTitle.length > 0) {
      kwScore = Math.max(0, kwScore - 5);
      kwRecs.push(`Remove terms already indexed in Title/Subtitle: ${opt.removedOverlapWithTitle.join(", ")}.`);
    }

    if (kwLen < 90) {
      kwRecs.push(`Keywords field has ${100 - kwLen} unused characters available.`);
    }
  }

  fieldScores.push({
    field: "iOS Keywords",
    score: kwScore,
    maxScore: 35,
    length: kwLen,
    maxLength: IOS_LIMITS.keywords,
    utilizationPercent: Math.round((kwLen / IOS_LIMITS.keywords) * 100),
    recommendations: kwRecs,
  });

  // 4. Description & Promotional Text (10 points)
  let descScore = 10;
  const descRecs: string[] = [];
  const descWords = (metadata.description || "").split(/\s+/).filter(Boolean).length;

  if (descWords < 20) {
    descScore = 6;
    descRecs.push("Description is very brief. Provide detailed features and social proof.");
  }
  if (!/(•|-|\*)\s/.test(metadata.description || "")) {
    descScore = Math.max(5, descScore - 2);
    descRecs.push("Add bullet points to break down key features for readability.");
  }

  fieldScores.push({
    field: "iOS Description",
    score: descScore,
    maxScore: 10,
    length: countCharacters(metadata.description),
    maxLength: IOS_LIMITS.description,
    utilizationPercent: Math.round((countCharacters(metadata.description) / IOS_LIMITS.description) * 100),
    recommendations: descRecs,
  });

  for (const fs of fieldScores) {
    recommendations.push(...fs.recommendations);
  }

  const totalScore = fieldScores.reduce((acc, f) => acc + f.score, 0);
  const grade = computeGrade(totalScore);

  return {
    locale,
    platform: "ios",
    overallScore: totalScore,
    grade,
    fieldScores,
    summary: `iOS ASO Score: ${totalScore}/100 (Grade ${grade})`,
    recommendations,
  };
}

export function auditAndroidMetadata(
  metadata: AndroidMetadata,
  locale: string = "en-US"
): LocaleAuditReport {
  const fieldScores: FieldAuditScore[] = [];
  const recommendations: string[] = [];

  // 1. Title Audit (30 points)
  const titleLen = countCharacters(metadata.title);
  let titleScore = 0;
  const titleRecs: string[] = [];

  if (titleLen > ANDROID_LIMITS.title) {
    titleScore = 0;
    titleRecs.push(`Google Play Title exceeds 30 characters limit.`);
  } else if (titleLen >= 24) {
    titleScore = 30;
  } else if (titleLen >= 18) {
    titleScore = 22;
    titleRecs.push(`Title uses ${titleLen}/${ANDROID_LIMITS.title} characters. Include primary genre keyword.`);
  } else {
    titleScore = 12;
    titleRecs.push(`Title is underutilized (${titleLen}/${ANDROID_LIMITS.title}).`);
  }

  fieldScores.push({
    field: "Android Title",
    score: titleScore,
    maxScore: 30,
    length: titleLen,
    maxLength: ANDROID_LIMITS.title,
    utilizationPercent: Math.round((titleLen / ANDROID_LIMITS.title) * 100),
    recommendations: titleRecs,
  });

  // 2. Short Description Audit (35 points)
  const shortLen = countCharacters(metadata.shortDescription);
  let shortScore = 0;
  const shortRecs: string[] = [];

  if (shortLen > ANDROID_LIMITS.shortDescription) {
    shortScore = 0;
    shortRecs.push(`Short Description exceeds 80 characters limit.`);
  } else if (shortLen >= 65) {
    shortScore = 35;
  } else if (shortLen >= 50) {
    shortScore = 28;
    shortRecs.push(`Short Description has ${ANDROID_LIMITS.shortDescription - shortLen} unused characters.`);
  } else {
    shortScore = 15;
    shortRecs.push(`Short description is too brief (${shortLen}/80). It is displayed above the fold in the store.`);
  }

  fieldScores.push({
    field: "Android Short Description",
    score: shortScore,
    maxScore: 35,
    length: shortLen,
    maxLength: ANDROID_LIMITS.shortDescription,
    utilizationPercent: Math.round((shortLen / ANDROID_LIMITS.shortDescription) * 100),
    recommendations: shortRecs,
  });

  // 3. Full Description & Formatting (35 points)
  const fullDesc = metadata.fullDescription || "";
  const fullLen = countCharacters(fullDesc);
  const words = fullDesc.split(/\s+/).filter(Boolean).length;
  let fullScore = 0;
  const fullRecs: string[] = [];

  if (fullLen > ANDROID_LIMITS.fullDescription) {
    fullScore = 0;
    fullRecs.push(`Full Description exceeds 4000 characters limit.`);
  } else {
    // Length & depth (15 pts)
    if (words >= 200) fullScore += 15;
    else if (words >= 100) fullScore += 12;
    else if (words >= 25) fullScore += 10;
    else {
      fullScore += 4;
      fullRecs.push("Full Description is under 25 words. Google's search crawler benefits from 250-400 words.");
    }

    // Structure & bullet points (10 pts)
    if (/(•|-|\*)\s/.test(fullDesc)) {
      fullScore += 10;
    } else {
      fullRecs.push("Add bullet points to list game/app features clearly.");
    }

    // Call to action (10 pts)
    if (/(download|play|join|start|try|install|jetzt|télécharger|descargar|今すぐ|지금)\b/i.test(fullDesc)) {
      fullScore += 10;
    } else {
      fullScore += 4;
      fullRecs.push("Include a strong call-to-action (e.g. 'Download now and explore...') in the description.");
    }
  }

  fieldScores.push({
    field: "Android Full Description",
    score: fullScore,
    maxScore: 35,
    length: fullLen,
    maxLength: ANDROID_LIMITS.fullDescription,
    utilizationPercent: Math.round((fullLen / ANDROID_LIMITS.fullDescription) * 100),
    recommendations: fullRecs,
  });

  for (const fs of fieldScores) {
    recommendations.push(...fs.recommendations);
  }

  const totalScore = fieldScores.reduce((acc, f) => acc + f.score, 0);
  const grade = computeGrade(totalScore);

  return {
    locale,
    platform: "android",
    overallScore: totalScore,
    grade,
    fieldScores,
    summary: `Google Play ASO Score: ${totalScore}/100 (Grade ${grade})`,
    recommendations,
  };
}

export function auditMetadata(
  metadata: LocalizedStoreMetadata
): LocaleAuditReport[] {
  const reports: LocaleAuditReport[] = [];
  if (metadata.ios) {
    reports.push(auditIosMetadata(metadata.ios, metadata.locale));
  }
  if (metadata.android) {
    reports.push(auditAndroidMetadata(metadata.android, metadata.locale));
  }
  return reports;
}

function computeGrade(score: number): "A+" | "A" | "B" | "C" | "D" {
  if (score >= 93) return "A+";
  if (score >= 82) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "D";
}
