// Function to compare two JSON objects and identify differences
export function compareJsonObjects(oldObj: any, newObj: any) {
  try {
    const result: Record<string, any> = {}

    // Handle null or undefined objects
    if (!oldObj && !newObj) return null
    if (!oldObj) return { status: "added", value: newObj }
    if (!newObj) return { status: "removed", value: oldObj }

    // Get all keys from both objects
    const oldKeys = typeof oldObj === "object" && oldObj !== null ? Object.keys(oldObj) : []
    const newKeys = typeof newObj === "object" && newObj !== null ? Object.keys(newObj) : []
    const allKeys = new Set([...oldKeys, ...newKeys])

    allKeys.forEach((key) => {
      const oldValue = oldObj?.[key]
      const newValue = newObj?.[key]

      // Key exists in both objects
      if (key in oldObj && key in newObj) {
        // Both values are objects - recursively compare
        if (typeof oldValue === "object" && oldValue !== null && typeof newValue === "object" && newValue !== null) {
          const childDiff = compareJsonObjects(oldValue, newValue)

          // If there are differences in the child objects
          if (childDiff && Object.keys(childDiff).length > 0) {
            result[key] = {
              status: "unchanged",
              value: newValue,
              children: childDiff,
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
      else if (key in newObj) {
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
export function countChanges(diff: Record<string, any>) {
  let added = 0
  let removed = 0
  let changed = 0
  let unchanged = 0

  const countRecursive = (obj: Record<string, any>) => {
    if (!obj) return

    Object.values(obj).forEach((value: any) => {
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

  countRecursive(diff)
  return { added, removed, changed, unchanged }
}
