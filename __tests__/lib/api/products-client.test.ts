import {
  getProducts,
  getProduct,
  getUserProducts,
  updateProduct,
  deleteProduct,
  voteProduct,
  getTodaysPicks,
  getFeaturedProducts,
  getTrendingProducts,
} from '@/lib/api/products-client'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
  rpc: jest.fn(),
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

describe('products-client API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })
  })

  describe('getProducts', () => {
    it('should fetch products with default parameters', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Test Product',
          tagline: 'Test tagline',
          vote_count: 10,
          comment_count: 5,
        },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
          count: 1,
        }),
      })

      const result = await getProducts()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products_with_stats')
      expect(result.products).toHaveLength(1)
      expect(result.count).toBe(1)
    })

    it('should handle search parameter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      await getProducts({ search: 'test query' })

      expect(mockQuery.or).toHaveBeenCalledWith(
        'name.ilike.%test query%,tagline.ilike.%test query%,description.ilike.%test query%'
      )
    })

    it('should handle different sort types', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      }

      mockSupabaseClient.from.mockReturnValue(mockQuery)

      // Test 'newest' sort
      await getProducts({ sort: 'newest' })
      expect(mockQuery.order).toHaveBeenCalledWith('launch_date', { ascending: false })

      // Test 'comments' sort
      await getProducts({ sort: 'comments' })
      expect(mockQuery.order).toHaveBeenCalledWith('comment_count', { ascending: false })

      // Test 'popular' sort (default)
      await getProducts({ sort: 'popular' })
      expect(mockQuery.order).toHaveBeenCalledWith('vote_count', { ascending: false })
    })

    it('should handle errors gracefully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
          count: 0,
        }),
      })

      const result = await getProducts()

      expect(result.products).toEqual([])
      expect(result.error).toEqual({ message: 'Database error' })
    })
  })

  describe('getProduct', () => {
    it('should fetch a single product by ID', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        user_id: 'user-123',
        category_id: 1,
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: mockProduct,
          error: null,
        }),
      })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getProduct('1')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products_with_stats')
      expect(result).toMatchObject(mockProduct)
    })

    it('should return null for non-existent product', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const result = await getProduct('999')

      expect(result).toBeNull()
    })
  })

  describe('updateProduct', () => {
    it('should update product when user is owner', async () => {
      const mockUser = { id: 'user-123' }
      const mockProductData = {
        name: 'Updated Product Name',
        tagline: 'Updated tagline',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock ownership check
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { user_id: 'user-123' },
          error: null,
        }),
      })

      // Mock update operation
      mockSupabaseClient.from.mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 1, ...mockProductData },
          error: null,
        }),
      })

      const result = await updateProduct(1, mockProductData)

      expect(result.data).toMatchObject(mockProductData)
      expect(result.error).toBeNull()
    })

    it('should reject update when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await updateProduct(1, { name: 'Updated Name' })

      expect(result.data).toBeNull()
      expect(result.error.message).toBe('Not authenticated')
    })

    it('should reject update when user is not owner', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock ownership check - different user
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { user_id: 'different-user' },
          error: null,
        }),
      })

      const result = await updateProduct(1, { name: 'Updated Name' })

      expect(result.data).toBeNull()
      expect(result.error.message).toBe('You do not have permission to update this product.')
    })
  })

  describe('deleteProduct', () => {
    it('should delete product when user is owner', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock ownership check
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { user_id: 'user-123' },
          error: null,
        }),
      })

      // Mock delete operation
      mockSupabaseClient.from.mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      const result = await deleteProduct(1)

      expect(result.error).toBeNull()
    })

    it('should reject delete when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await deleteProduct(1)

      expect(result.error.message).toBe('Not authenticated')
    })
  })

  describe('voteProduct', () => {
    it('should toggle vote when user is authenticated', async () => {
      const mockUser = { id: 'user-123' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await voteProduct(1)

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('toggle_vote', {
        p_product_id: 1,
      })
      expect(result.data).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should return error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await voteProduct(1)

      expect(result.data).toBeNull()
      expect(result.error.message).toBe('User must be authenticated to vote')
    })
  })

  describe('getTodaysPicks', () => {
    it('should fetch today\'s picks', async () => {
      const today = new Date().toISOString().split('T')[0]
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })

      await getTodaysPicks()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products_with_stats')
    })
  })

  describe('getFeaturedProducts', () => {
    it('should fetch featured products', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })

      await getFeaturedProducts()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products_with_stats')
    })
  })

  describe('getTrendingProducts', () => {
    it('should fetch trending products from last 7 days', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })

      await getTrendingProducts()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products_with_stats')
    })
  })
})