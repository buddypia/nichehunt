import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProductCard } from '@/components/ProductCard'
import type { ProductWithRelations } from '@/lib/types/database'

// Mock the SaveToCollectionPopover component
jest.mock('@/components/SaveToCollectionPopover', () => ({
  SaveToCollectionPopover: ({ productId, onSaveStateChange, isSaved }: any) => (
    <button 
      onClick={() => onSaveStateChange(!isSaved)}
      data-testid="save-collection-button"
    >
      {isSaved ? 'Saved' : 'Save'}
    </button>
  ),
}))

const mockProduct: ProductWithRelations = {
  id: 1,
  name: 'Test Product',
  tagline: 'This is a test product',
  description: 'A detailed description of the test product',
  thumbnail_url: 'https://example.com/thumbnail.jpg',
  product_url: 'https://example.com/product',
  github_url: 'https://github.com/example/product',
  demo_url: 'https://demo.example.com',
  user_id: 'user-123',
  category_id: 1,
  status: 'published',
  launch_date: '2024-01-01',
  is_featured: false,
  view_count: 100,
  vote_count: 10,
  comment_count: 5,
  has_voted: false,
  is_saved: false,
  locale: 'en',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  profile: {
    id: 'user-123',
    username: 'testuser',
    display_name: 'Test User',
    bio: 'Test user bio',
    avatar_url: 'https://example.com/avatar.jpg',
    website_url: null,
    twitter_handle: null,
    slug: 'testuser',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  category: {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Technology category',
    icon_name: 'tech',
    created_at: '2024-01-01T00:00:00Z',
  },
  tags: [
    {
      id: 1,
      name: 'React',
      slug: 'react',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'TypeScript',
      slug: 'typescript',
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  images: [],
}

describe('ProductCard', () => {
  const mockOnVote = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onVote={mockOnVote} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('This is a test product')).toBeInTheDocument()
    expect(screen.getByText('@testuser')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('displays vote count correctly', () => {
    render(<ProductCard product={mockProduct} onVote={mockOnVote} />)
    
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('displays comment count correctly', () => {
    render(<ProductCard product={mockProduct} onVote={mockOnVote} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('handles vote button click', async () => {
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      rpc: jest.fn().mockResolvedValue({
        data: true,
        error: null,
      }),
    }

    // Mock the createClient function
    require('@/lib/supabase/client').createClient.mockReturnValue(mockSupabaseClient)

    render(<ProductCard product={mockProduct} onVote={mockOnVote} />)

    const voteButton = screen.getByRole('button', { name: /10/ })
    fireEvent.click(voteButton)

    await waitFor(() => {
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('toggle_vote', {
        p_product_id: 1,
      })
    })
  })

  it('shows "Newest" badge for new products', () => {
    const newProduct = {
      ...mockProduct,
      launch_date: new Date().toISOString(),
    }

    render(<ProductCard product={newProduct} onVote={mockOnVote} />)
    
    expect(screen.getByText('Newest')).toBeInTheDocument()
  })

  it('shows "Popular" badge for hot products', () => {
    const hotProduct = {
      ...mockProduct,
      vote_count: 15,
    }

    render(<ProductCard product={hotProduct} onVote={mockOnVote} />)
    
    expect(screen.getByText('Popular')).toBeInTheDocument()
  })

  it('shows "Featured" badge for featured products', () => {
    const featuredProduct = {
      ...mockProduct,
      is_featured: true,
    }

    render(<ProductCard product={featuredProduct} onVote={mockOnVote} />)
    
    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('displays ranking badges correctly', () => {
    const { rerender } = render(
      <ProductCard product={mockProduct} onVote={mockOnVote} rank={1} />
    )
    
    // Check for trophy icon (rank 1)
    expect(document.querySelector('[data-lucide="trophy"]')).toBeInTheDocument()

    rerender(<ProductCard product={mockProduct} onVote={mockOnVote} rank={2} />)
    
    // Check for medal icon (rank 2)
    expect(document.querySelector('[data-lucide="medal"]')).toBeInTheDocument()

    rerender(<ProductCard product={mockProduct} onVote={mockOnVote} rank={3} />)
    
    // Check for award icon (rank 3)
    expect(document.querySelector('[data-lucide="award"]')).toBeInTheDocument()
  })

  it('handles save to collection', () => {
    render(<ProductCard product={mockProduct} onVote={mockOnVote} />)

    const saveButton = screen.getByTestId('save-collection-button')
    expect(saveButton).toHaveTextContent('Save')

    fireEvent.click(saveButton)
    expect(saveButton).toHaveTextContent('Saved')
  })

  it('truncates tags display when more than 2 tags', () => {
    const productWithManyTags = {
      ...mockProduct,
      tags: [
        { id: 1, name: 'React', slug: 'react', created_at: '2024-01-01' },
        { id: 2, name: 'TypeScript', slug: 'typescript', created_at: '2024-01-01' },
        { id: 3, name: 'Next.js', slug: 'nextjs', created_at: '2024-01-01' },
        { id: 4, name: 'Tailwind', slug: 'tailwind', created_at: '2024-01-01' },
      ],
    }

    render(<ProductCard product={productWithManyTags} onVote={mockOnVote} />)
    
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.queryByText('Next.js')).not.toBeInTheDocument()
  })

  it('handles unauthenticated user vote attempt', async () => {
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    }

    require('@/lib/supabase/client').createClient.mockReturnValue(mockSupabaseClient)

    const mockRouterPush = jest.fn()
    require('next/navigation').useRouter.mockReturnValue({
      push: mockRouterPush,
    })

    render(<ProductCard product={mockProduct} onVote={mockOnVote} />)

    const voteButton = screen.getByRole('button', { name: /10/ })
    fireEvent.click(voteButton)

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/auth/signin')
    })
  })
})