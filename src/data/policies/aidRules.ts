import type { AidRule } from "@/src/domain/schemas";
import { policyResources } from "./resources";
import { xiaoludengRule } from "./xiaoludeng";

export const aidRules: AidRule[] = [xiaoludengRule];

export const defaultAidRule = aidRules[0];

export function findAidRule(id: string | null | undefined): AidRule | undefined {
  return aidRules.find((rule) => rule.id === id);
}

export const unstructuredCharityResources = policyResources.filter(
  (resource) =>
    resource.category === "公益项目" &&
    !resource.isArchived &&
    !aidRules.some((rule) => rule.resourceId === resource.id),
);
