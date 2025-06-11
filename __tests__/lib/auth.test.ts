import {
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  isAuthenticated,
  getSession,
} from '@/lib/auth'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(),
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

// Mock window.location
const mockLocation = {
  pathname: '/',
  origin: 'http://localhost:3000',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

// Mock translations
jest.mock('@/lib/i18n/translations/ja', () => ({
  ja: {
    errors: {
      usernameAlreadyExists: 'ユーザー名は既に存在します',
      emailAlreadyRegistered: 'メールアドレスは既に登録されています',
      registrationFailed: '登録に失敗しました',
      userCreationFailed: 'ユーザー作成に失敗しました',
      profileCreationFailed: 'プロファイル作成に失敗しました',
      invalidCredentials: '無効な認証情報です',
      loginFailed: 'ログインに失敗しました',
      logoutFailed: 'ログアウトに失敗しました',
    },
  },
}))

jest.mock('@/lib/i18n/translations/en', () => ({
  en: {
    errors: {
      usernameAlreadyExists: 'Username already exists',
      emailAlreadyRegistered: 'Email already registered',
      registrationFailed: 'Registration failed',
      userCreationFailed: 'User creation failed',
      profileCreationFailed: 'Profile creation failed',
      invalidCredentials: 'Invalid credentials',
      loginFailed: 'Login failed',
      logoutFailed: 'Logout failed',
    },
  },
}))

describe('auth functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    
    // Setup default mock return values
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      // Mock username availability check
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })

      // Mock auth signup
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock profile creation
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      })

      const result = await signUp('test@example.com', 'password123', 'testuser', 'Test User')

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { username: 'testuser' },
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      })

      expect(result.user).toEqual(mockUser)
    })

    it('should throw error if username already exists', async () => {
      // Mock username already exists
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'existing-user' },
          error: null,
        }),
      })

      await expect(
        signUp('test@example.com', 'password123', 'existing-user', 'Test User')
      ).rejects.toThrow('ユーザー名は既に存在します')
    })

    it('should throw error if email is already registered', async () => {
      // Mock username availability check
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })

      // Mock auth signup error
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      })

      await expect(
        signUp('existing@example.com', 'password123', 'testuser', 'Test User')
      ).rejects.toThrow('メールアドレスは既に登録されています')
    })
  })

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await signIn('test@example.com', 'password123')

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user).toEqual(mockUser)
    })

    it('should throw error for invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      })

      await expect(
        signIn('test@example.com', 'wrongpassword')
      ).rejects.toThrow('無効な認証情報です')
    })
  })

  describe('signInWithGoogle', () => {
    it('should initiate Google OAuth sign in', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://oauth.google.com' },
        error: null,
      })

      const result = await signInWithGoogle()

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback-client',
          queryParams: {
            prompt: 'select_account',
          },
        },
      })

      expect(result.provider).toBe('google')
    })

    it('should throw error if OAuth fails', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth error' },
      })

      await expect(signInWithGoogle()).rejects.toThrow('OAuth error')
    })
  })

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      })

      await expect(signOut()).resolves.not.toThrow()

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })

    it('should throw error if sign out fails', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out error' },
      })

      await expect(signOut()).rejects.toThrow('ログアウトに失敗しました')
    })
  })

  describe('getCurrentUser', () => {
    it('should return user with profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      const mockProfile = {
        id: 'user-123',
        username: 'testuser',
        display_name: 'Test User',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      })

      const result = await getCurrentUser()

      expect(result).toEqual(mockProfile)
    })

    it('should return null if no user is authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })

    it('should create profile if it does not exist', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      }

      const mockNewProfile = {
        id: 'user-123',
        username: 'test',
        display_name: 'Test User',
        slug: 'test',
        avatar_url: 'https://example.com/avatar.jpg',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // First call for fetching profile (not found)
      // Second call for creating profile
      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockNewProfile,
            error: null,
          }),
        })

      const result = await getCurrentUser()

      expect(result).toEqual(mockNewProfile)
    })
  })

  describe('isAuthenticated', () => {
    it('should return true if user is authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      const result = await isAuthenticated()

      expect(result).toBe(true)
    })

    it('should return false if no user is authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await isAuthenticated()

      expect(result).toBe(false)
    })

    it('should return false if there is an error', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Auth error'))

      const result = await isAuthenticated()

      expect(result).toBe(false)
    })
  })

  describe('getSession', () => {
    it('should return session if available', async () => {
      const mockSession = {
        user: { id: 'user-123' },
        access_token: 'token',
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await getSession()

      expect(result).toEqual(mockSession)
    })

    it('should return null if no session', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await getSession()

      expect(result).toBeNull()
    })

    it('should return null if there is an error', async () => {
      mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Session error'))

      const result = await getSession()

      expect(result).toBeNull()
    })
  })

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = jest.fn()
      const mockUnsubscribe = jest.fn()

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: mockUnsubscribe },
      })

      const result = onAuthStateChange(mockCallback)

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback)
      expect(result).toEqual({ data: { subscription: mockUnsubscribe } })
    })
  })
})