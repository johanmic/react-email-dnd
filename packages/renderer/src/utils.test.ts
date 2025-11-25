
import { describe, it, expect } from "vitest"
import { deepSubstitute, substituteObject } from "./utils"

describe("substituteObject", () => {
  it("should substitute object variable without spaces", () => {
    const context = {
      variables: {
        user: { name: "John" },
      },
    }
    const result = substituteObject("{{user}}", context)
    expect(result).toEqual({ name: "John" })
  })

  it("should substitute object variable with spaces", () => {
    const context = {
      variables: {
        user: { name: "John" },
      },
    }
    const result = substituteObject("{{ user }}", context)
    expect(result).toEqual({ name: "John" })
  })

  it("should return original string if variable not found and throwOnMissingVariables is false", () => {
    const context = {
      variables: {},
      throwOnMissingVariables: false,
    }
    const result = substituteObject("{{ user }}", context)
    expect(result).toBe("{{ user }}")
  })
})

describe("deepSubstitute", () => {
  it("should substitute nested object variables with spaces", () => {
    const context = {
      variables: {
        club: { name: "My Club" },
      },
    }
    const input = {
      props: {
        club: "{{ club }}",
      },
    }
    const result = deepSubstitute(input, context)
    expect(result).toEqual({
      props: {
        club: { name: "My Club" },
      },
    })
  })
})
