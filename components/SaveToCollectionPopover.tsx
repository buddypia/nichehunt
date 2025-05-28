"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2, Check, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase-client"
import {
  getUserCollections,
  createCollection,
  addProductToCollection,
  removeProductFromCollection,
  isProductInCollection,
} from "@/lib/api/collections"
import type { Collection } from "@/lib/types/database"

interface SaveToCollectionPopoverProps {
  productId: number
  onSaveStateChange?: (isSaved: boolean) => void
  isSaved?: boolean
}

export function SaveToCollectionPopover({
  productId,
  onSaveStateChange,
  isSaved: initialIsSaved = false,
}: SaveToCollectionPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [checkedCollections, setCheckedCollections] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // ポップオーバーが開かれたときにコレクションとチェック状態を取得
  useEffect(() => {
    if (isOpen) {
      loadCollectionsAndCheckStates()
    }
  }, [isOpen, productId])

  const loadCollectionsAndCheckStates = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/signin')
        return
      }

      // ユーザーのコレクションを取得
      const userCollections = await getUserCollections(user.id)
      setCollections(userCollections)

      // 各コレクションにプロダクトが含まれているかチェック
      const checkedIds = new Set<number>()
      for (const collection of userCollections) {
        const isInCollection = await isProductInCollection(collection.id, productId)
        if (isInCollection) {
          checkedIds.add(collection.id)
        }
      }
      setCheckedCollections(checkedIds)

      // 保存状態を親コンポーネントに通知
      if (onSaveStateChange) {
        onSaveStateChange(checkedIds.size > 0)
      }
    } catch (error) {
      console.error('Error loading collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCollectionToggle = async (collectionId: number, checked: boolean) => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      let success = false
      if (checked) {
        success = await addProductToCollection(collectionId, productId)
      } else {
        success = await removeProductFromCollection(collectionId, productId)
      }

      if (success) {
        const newCheckedCollections = new Set(checkedCollections)
        if (checked) {
          newCheckedCollections.add(collectionId)
        } else {
          newCheckedCollections.delete(collectionId)
        }
        setCheckedCollections(newCheckedCollections)

        // 保存状態を親コンポーネントに通知
        if (onSaveStateChange) {
          onSaveStateChange(newCheckedCollections.size > 0)
        }
      }
    } catch (error) {
      console.error('Error toggling collection:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateNewCollection = async () => {
    if (!newCollectionName.trim()) return

    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const newCollection = await createCollection(
        user.id,
        newCollectionName.trim(),
        '',
        true
      )

      if (newCollection) {
        // 新しいコレクションを追加
        setCollections([newCollection, ...collections])
        
        // 新しいコレクションにプロダクトを追加
        const success = await addProductToCollection(newCollection.id, productId)
        if (success) {
          const newCheckedCollections = new Set(checkedCollections)
          newCheckedCollections.add(newCollection.id)
          setCheckedCollections(newCheckedCollections)

          // 保存状態を親コンポーネントに通知
          if (onSaveStateChange) {
            onSaveStateChange(true)
          }
        }

        // フォームをリセット
        setNewCollectionName("")
        setIsCreatingNew(false)
      }
    } catch (error) {
      console.error('Error creating new collection:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const isSaved = checkedCollections.size > 0

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isSaved ? "default" : "outline"}
          size="icon"
          className={cn(
            "h-8 w-8 transition-all duration-200",
            isSaved ? "bg-amber-500 hover:bg-amber-600 border-amber-500" : "hover:border-amber-500 hover:text-amber-500"
          )}
        >
          <Bookmark className={cn(
            "w-4 h-4 transition-all duration-200",
            isSaved && "fill-current"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
        alignOffset={-5}
        sideOffset={10}
      >
        <div className="p-4 pb-2">
          <h4 className="font-medium text-sm">保存先を選択</h4>
          <p className="text-xs text-muted-foreground mt-1">
            複数のコレクションに保存できます
          </p>
        </div>

        <Separator />

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[300px]">
              <div className="p-2">
                {collections.length === 0 && !isCreatingNew ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">
                    コレクションがありません
                  </p>
                ) : (
                  <div className="space-y-1">
                    {collections.map((collection) => (
                      <div
                        key={collection.id}
                        className="flex items-center space-x-3 rounded-md px-3 py-2 hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={`collection-${collection.id}`}
                          checked={checkedCollections.has(collection.id)}
                          onCheckedChange={(checked) =>
                            handleCollectionToggle(collection.id, checked as boolean)
                          }
                          disabled={isSaving}
                        />
                        <Label
                          htmlFor={`collection-${collection.id}`}
                          className="flex-1 cursor-pointer text-sm font-normal"
                        >
                          {collection.name}
                          {collection.description && (
                            <span className="block text-xs text-muted-foreground">
                              {collection.description}
                            </span>
                          )}
                        </Label>
                        {checkedCollections.has(collection.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isCreatingNew && (
                  <div className="mt-2 space-y-2 p-3 border rounded-md bg-accent/20">
                    <Input
                      placeholder="新しいコレクション名"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateNewCollection()
                        }
                      }}
                      disabled={isSaving}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleCreateNewCollection}
                        disabled={!newCollectionName.trim() || isSaving}
                        className="flex-1"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "作成して保存"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsCreatingNew(false)
                          setNewCollectionName("")
                        }}
                        disabled={isSaving}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsCreatingNew(true)}
                disabled={isCreatingNew || isSaving}
              >
                <Plus className="h-4 w-4 mr-2" />
                新しいコレクションを作成
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
