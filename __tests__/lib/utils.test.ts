import { cn, formatDate, formatRelativeTime } from '@/lib/utils'

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('bg-red-500', 'text-white', 'p-4')
      expect(result).toBe('bg-red-500 text-white p-4')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class', 'other-class')
      expect(result).toBe('base-class active-class other-class')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('bg-red-500', 'bg-blue-500')
      expect(result).toBe('bg-blue-500')
    })

    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'other-class')
      expect(result).toBe('base-class other-class')
    })
  })

  describe('formatDate function', () => {
    const testDate = new Date('2024-01-15T10:30:00Z')

    it('should format date in Japanese locale by default', () => {
      const result = formatDate(testDate)
      expect(result).toMatch(/1月|Jan/)
    })

    it('should format date in English locale', () => {
      const result = formatDate(testDate, 'en')
      expect(result).toMatch(/Jan/)
    })

    it('should format date in Japanese locale', () => {
      const result = formatDate(testDate, 'ja')
      expect(result).toMatch(/1月/)
    })

    it('should handle string input', () => {
      const result = formatDate('2024-01-15T10:30:00Z', 'en')
      expect(result).toMatch(/Jan/)
    })

    it('should apply custom options', () => {
      const options = { 
        year: 'numeric' as const, 
        month: 'long' as const, 
        day: 'numeric' as const 
      }
      const result = formatDate(testDate, 'en', options)
      expect(result).toMatch(/January|2024/)
    })

    it('should handle different date formats', () => {
      const isoDate = '2024-01-15'
      const result = formatDate(isoDate, 'en')
      expect(result).toMatch(/Jan/)
    })
  })

  describe('formatRelativeTime function', () => {
    beforeEach(() => {
      // Mock current time to have consistent tests
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should format "just now" for very recent times', () => {
      const recentDate = new Date('2024-01-15T11:59:50Z') // 10 seconds ago
      const result = formatRelativeTime(recentDate, 'en')
      expect(result).toBe('just now')
    })

    it('should format "just now" in Japanese', () => {
      const recentDate = new Date('2024-01-15T11:59:50Z')
      const result = formatRelativeTime(recentDate, 'ja')
      expect(result).toBe('たった今')
    })

    it('should format minutes ago', () => {
      const minutesAgo = new Date('2024-01-15T11:55:00Z') // 5 minutes ago
      const result = formatRelativeTime(minutesAgo, 'en')
      expect(result).toMatch(/5 minutes ago/)
    })

    it('should format hours ago', () => {
      const hoursAgo = new Date('2024-01-15T09:00:00Z') // 3 hours ago
      const result = formatRelativeTime(hoursAgo, 'en')
      expect(result).toMatch(/3 hours ago/)
    })

    it('should format days ago', () => {
      const daysAgo = new Date('2024-01-13T12:00:00Z') // 2 days ago
      const result = formatRelativeTime(daysAgo, 'en')
      expect(result).toMatch(/2 days ago/)
    })

    it('should format months ago', () => {
      const monthsAgo = new Date('2023-11-15T12:00:00Z') // ~2 months ago
      const result = formatRelativeTime(monthsAgo, 'en')
      expect(result).toMatch(/months ago/)
    })

    it('should format years ago', () => {
      const yearsAgo = new Date('2022-01-15T12:00:00Z') // 2 years ago
      const result = formatRelativeTime(yearsAgo, 'en')
      expect(result).toMatch(/2 years ago/)
    })

    it('should handle string input', () => {
      const hoursAgo = '2024-01-15T09:00:00Z'
      const result = formatRelativeTime(hoursAgo, 'en')
      expect(result).toMatch(/3 hours ago/)
    })

    it('should format in Japanese locale', () => {
      const hoursAgo = new Date('2024-01-15T09:00:00Z')
      const result = formatRelativeTime(hoursAgo, 'ja')
      expect(result).toMatch(/時間前/)
    })

    it('should handle future dates gracefully', () => {
      const futureDate = new Date('2024-01-15T15:00:00Z') // 3 hours in future
      const result = formatRelativeTime(futureDate, 'en')
      // The function should handle this case, even if it shows "in 3 hours"
      expect(typeof result).toBe('string')
    })

    it('should handle edge cases with very old dates', () => {
      const veryOld = new Date('1990-01-01T00:00:00Z')
      const result = formatRelativeTime(veryOld, 'en')
      expect(result).toMatch(/years ago/)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle invalid date strings gracefully', () => {
      expect(() => formatDate('invalid-date')).not.toThrow()
      expect(() => formatRelativeTime('invalid-date')).not.toThrow()
    })

    it('should handle null/undefined locale gracefully', () => {
      const testDate = new Date('2024-01-15T10:30:00Z')
      expect(() => formatDate(testDate, undefined as any)).not.toThrow()
      expect(() => formatRelativeTime(testDate, undefined as any)).not.toThrow()
    })

    it('should handle empty string locale', () => {
      const testDate = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(testDate, '')
      expect(typeof result).toBe('string')
    })

    it('should handle unsupported locale codes', () => {
      const testDate = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(testDate, 'xyz')
      expect(typeof result).toBe('string')
    })
  })
})