import type { Prisma } from "@prisma/client";

/**
 * Cursor-based pagination utility for tRPC
 */

export interface PaginationInput {
  limit: number;
  cursor?: string;
  direction?: "forward" | "backward";
}

export interface PaginatedResult<T> {
  items: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
  totalCount?: number;
}

/**
 * Create cursor-based pagination arguments for Prisma
 */
export function createPaginationArgs<T extends Record<string, any>>(
  input: PaginationInput,
  orderBy: Prisma.Enumerable<T>,
  cursorField: keyof T = "id" as keyof T
): {
  take: number;
  skip?: number;
  cursor?: { [K in keyof T]?: T[K] };
  orderBy: Prisma.Enumerable<T>;
} {
  const { limit, cursor, direction = "forward" } = input;
  
  const take = direction === "forward" ? limit + 1 : -(limit + 1);
  
  const args: any = {
    take,
    orderBy,
  };

  if (cursor) {
    args.cursor = { [cursorField]: cursor };
    args.skip = 1; // Skip the cursor record itself
  }

  return args;
}

/**
 * Process pagination results and create response
 */
export function processPaginationResults<T extends Record<string, any>>(
  items: T[],
  input: PaginationInput,
  cursorField: keyof T = "id" as keyof T
): PaginatedResult<T> {
  const { limit, direction = "forward" } = input;
  
  let hasNextPage = false;
  let hasPreviousPage = false;
  let processedItems = items;

  if (direction === "forward") {
    hasNextPage = items.length > limit;
    hasPreviousPage = !!input.cursor;
    
    if (hasNextPage) {
      processedItems = items.slice(0, -1);
    }
  } else {
    hasPreviousPage = items.length > limit;
    hasNextPage = !!input.cursor;
    
    if (hasPreviousPage) {
      processedItems = items.slice(1);
    }
    
    // Reverse items for backward pagination
    processedItems = processedItems.reverse();
  }

  const nextCursor = hasNextPage && processedItems.length > 0
    ? String(processedItems[processedItems.length - 1]?.[cursorField])
    : undefined;
    
  const previousCursor = hasPreviousPage && processedItems.length > 0
    ? String(processedItems[0]?.[cursorField])
    : undefined;

  return {
    items: processedItems,
    hasNextPage,
    hasPreviousPage,
    nextCursor,
    previousCursor,
  };
}

/**
 * Offset-based pagination utility (for simpler cases)
 */
export interface OffsetPaginationInput {
  page: number;
  limit: number;
}

export interface OffsetPaginatedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function createOffsetPaginationArgs(input: OffsetPaginationInput): {
  take: number;
  skip: number;
} {
  const { page, limit } = input;
  return {
    take: limit,
    skip: (page - 1) * limit,
  };
}

export function processOffsetPaginationResults<T>(
  items: T[],
  totalCount: number,
  input: OffsetPaginationInput
): OffsetPaginatedResult<T> {
  const { page, limit } = input;
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    items,
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Search utilities
 */
export function createSearchConditions(
  query?: string,
  searchFields: string[] = ["title", "description"]
): Prisma.StringFilter | undefined {
  if (!query) return undefined;
  
  const searchTerms = query.split(" ").filter(term => term.length > 0);
  
  if (searchTerms.length === 0) return undefined;
  
  // Create an OR condition for each search field with each search term
  return {
    OR: searchFields.flatMap(field => 
      searchTerms.map(term => ({
        [field]: {
          contains: term,
          mode: "insensitive" as const,
        },
      }))
    ),
  } as any;
}

/**
 * Date range filtering utilities
 */
export function createDateRangeFilter(
  from?: Date,
  to?: Date,
  field: string = "createdAt"
): Record<string, any> | undefined {
  if (!from && !to) return undefined;
  
  const filter: Record<string, any> = {};
  
  if (from && to) {
    filter[field] = {
      gte: from,
      lte: to,
    };
  } else if (from) {
    filter[field] = {
      gte: from,
    };
  } else if (to) {
    filter[field] = {
      lte: to,
    };
  }
  
  return filter;
}

/**
 * Sort utilities
 */
export function createSortCondition<T>(
  sortBy?: string,
  sortDirection: "asc" | "desc" = "desc",
  defaultSort: Record<string, "asc" | "desc"> = { createdAt: "desc" }
): Prisma.Enumerable<T> {
  if (!sortBy) {
    return defaultSort as Prisma.Enumerable<T>;
  }
  
  return { [sortBy]: sortDirection } as Prisma.Enumerable<T>;
}

/**
 * Combine multiple filters
 */
export function combineFilters(...filters: (Record<string, any> | undefined)[]): Record<string, any> {
  const validFilters = filters.filter(Boolean);
  
  if (validFilters.length === 0) return {};
  if (validFilters.length === 1) return validFilters[0]!;
  
  return {
    AND: validFilters,
  };
}

/**
 * Create inclusion filter (e.g., for soft deletes)
 */
export function createInclusionFilter(
  includeDeleted: boolean = false,
  deletedField: string = "deletedAt"
): Record<string, any> {
  if (includeDeleted) return {};
  
  return {
    [deletedField]: null,
  };
}

/**
 * Permission-based filtering
 */
export function createPermissionFilter(
  userId: string,
  userRole: "ADMIN" | "INTERVIEWER",
  ownerField: string = "userId"
): Record<string, any> {
  // Admins can see everything
  if (userRole === "ADMIN") {
    return {};
  }
  
  // Regular users can only see their own records
  return {
    [ownerField]: userId,
  };
}

/**
 * Utility for counting total items (useful for offset pagination)
 */
export async function countWithFilters<T>(
  model: any,
  filters: Record<string, any>
): Promise<number> {
  return model.count({
    where: filters,
  });
}