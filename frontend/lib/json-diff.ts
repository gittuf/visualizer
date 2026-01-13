import { JsonValue, JsonObject } from "./types"

export interface DiffEntry {
  status: "added" | "removed" | "changed" | "unchanged"
  value?: JsonValue
  oldValue?: JsonValue
  children?: Record<string, DiffEntry>
}

export type DiffResult = Record<string, DiffEntry>

// Function to compare two JSON objects and identify differences
export function compareJsonObjects(
  oldObj: JsonObject | null | undefined,
  newObj: JsonObject | null | undefined,
): DiffResult | DiffEntry | null {
  try {
    const result: DiffResult = {}

    // Handle null or undefined objects
    if (!oldObj && !newObj) return null
    if (!oldObj) return { status: "added", value: newObj as JsonValue }
    if (!newObj) return { status: "removed", value: oldObj as JsonValue }

    // Get all keys from both objects
    const oldKeys = oldObj ? Object.keys(oldObj) : []
    const newKeys = newObj ? Object.keys(newObj) : []
    const allKeys = new Set([...oldKeys, ...newKeys])

    allKeys.forEach((key) => {
      const oldValue = oldObj ? oldObj[key] : undefined
      const newValue = newObj ? newObj[key] : undefined

      // Key exists in both objects
      if (oldObj && key in oldObj && newObj && key in newObj) {
        // Both values are objects - recursively compare
        if (
          typeof oldValue === "object" &&
          oldValue !== null &&
          !Array.isArray(oldValue) &&
          typeof newValue === "object" &&
          newValue !== null &&
          !Array.isArray(newValue)
        ) {
          const childDiff = compareJsonObjects(oldValue as JsonObject, newValue as JsonObject)

          // If there are differences in the child objects
          if (childDiff) {
            // If childDiff is a Record<string, DiffEntry>, use it as children
            // If it's a single DiffEntry (from null check shortcut), what do we do?
            // The recursive call with two objects should return a DiffResult (Record)
            // unless one was null, but we checked type===object && !== null.
            // So childDiff should be DiffResult here.
            
            const hasChanges = Object.keys(childDiff).length > 0
            if (hasChanges) {
               result[key] = {
                status: "unchanged",
                value: newValue,
                children: childDiff as Record<string, DiffEntry>,
              }
            } else {
              result[key] = { status: "unchanged", value: newValue }
            }
          } else {
             result[key] = { status: "unchanged", value: newValue }
          }
        }
        // Values are different
        else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          result[key] = {
            status: "changed",
            oldValue: oldValue,
            value: newValue,
          }
        }
        // Values are the same
        else {
          result[key] = { status: "unchanged", value: newValue }
        }
      }
      // Key only exists in the new object
      else if (newObj && key in newObj) {
        result[key] = { status: "added", value: newValue }
      }
      // Key only exists in the old object
      else {
        result[key] = { status: "removed", value: oldValue }
      }
    })

    return result
  } catch (error) {
    console.error("Error comparing JSON objects:", error)
    throw new Error("Failed to compare JSON objects. Please check the data format.")
  }
}

// Function to count the number of changes in a diff object
export function countChanges(diff: DiffResult | DiffEntry | null) {
  let added = 0
  let removed = 0
  let changed = 0
  let unchanged = 0

  if (!diff) return { added, removed, changed, unchanged }
  
  // Handle edge case where diff is a single DiffEntry
  if ('status' in diff && typeof diff.status === 'string') {
      const entry = diff as DiffEntry;
      if (entry.status === 'added') added++;
      else if (entry.status === 'removed') removed++;
      else if (entry.status === 'changed') changed++;
      else if (entry.status === 'unchanged') unchanged++;
      
      if (entry.children) {
         const childrenCounts = countChanges(entry.children);
         added += childrenCounts.added;
         removed += childrenCounts.removed;
         changed += childrenCounts.changed;
         unchanged += childrenCounts.unchanged;
      }
      return { added, removed, changed, unchanged };
  }

  const countRecursive = (obj: Record<string, DiffEntry>) => {
    if (!obj) return

    Object.values(obj).forEach((value: DiffEntry) => {
      if (value.status === "added") {
        added++
      } else if (value.status === "removed") {
        removed++
      } else if (value.status === "changed") {
        changed++
      } else if (value.status === "unchanged") {
        unchanged++
      }

      if (value.children) {
        countRecursive(value.children)
      }
    })
  }

  countRecursive(diff as Record<string, DiffEntry>)
  return { added, removed, changed, unchanged }
}
