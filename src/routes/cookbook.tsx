import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Plus, BookOpen, Heart, FileText, Trash2, ArrowUpRight, FolderPlus, Check, Utensils } from 'lucide-react';
import { useVault } from '@/components/vault-provider';
import { RecipeCard, PageHeading, EmptyState } from '@/components/recipe-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { pageMeta } from '@/lib/metadata';
import { toast } from 'sonner';

export const Route = createFileRoute('/cookbook')({
  component: Cookbook,
  head: () =>
    pageMeta(
      'My Cookbook & Collections',
      'Curated collections, saved favorites, and simmering recipe drafts on your digital shelf.'
    ),
});

function Cookbook() {
  const { items, saved, collections, createCollection, deleteCollection } = useVault();
  const [tab, setTab] = useState<'saved' | 'collections' | 'drafts'>('saved');
  const [modalOpen, setModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDesc, setCollectionDesc] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');

  const activeCollection = useMemo(
    () => collections.find(c => c.id === selectedCollectionId),
    [collections, selectedCollectionId]
  );

  // Filter recipes depending on active tab
  const visibleRecipes = useMemo(() => {
    return items.filter(r => {
      if (tab === 'drafts') return r.status === 'Draft';
      if (tab === 'collections') {
        return activeCollection ? activeCollection.ids.includes(r.id) : false;
      }
      // Saved tab
      return saved.includes(r.id);
    });
  }, [items, tab, activeCollection, saved]);

  const draftCount = useMemo(
    () => items.filter(r => r.status === 'Draft').length,
    [items]
  );

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionName.trim()) return;
    createCollection(collectionName.trim(), collectionDesc.trim());
    setCollectionName('');
    setCollectionDesc('');
    setModalOpen(false);
    toast.success('New collection shelf added!');
  };

  return (
    <div className="standard-page">
      <PageHeading
        eyebrow="YOUR PERSONAL KITCHEN SHELF"
        title="Recipes worth keeping."
        description="A quiet corner for your bookmarked favorites, curated menus, and works in progress."
        action={
          <Button asChild className="rounded-full bg-primary text-primary-foreground gap-2 shadow-sm h-10 sm:h-11 px-5 sm:px-6 text-sm font-semibold hover:bg-primary/90 w-full sm:w-auto cursor-pointer">
            <Link to="/create">
              <Plus size={16} /> Add a recipe
            </Link>
          </Button>
        }
      />

      {/* Tabs */}
      <div className="content-tabs no-scrollbar scroll-smooth py-1 px-0.5 mb-5 sm:mb-6">
        <Button
          variant="ghost"
          className={`rounded-full gap-2 ${tab === 'saved' ? 'selected' : ''}`}
          onClick={() => {
            setTab('saved');
            setSelectedCollectionId('');
          }}
        >
          <Heart size={15} className={tab === 'saved' ? 'fill-current text-primary-foreground' : 'text-primary'} />
          <span>Saved recipes</span>
          <span className="tabular font-semibold opacity-85">({saved.length})</span>
        </Button>

        <Button
          variant="ghost"
          className={`rounded-full gap-2 ${tab === 'collections' ? 'selected' : ''}`}
          onClick={() => setTab('collections')}
        >
          <BookOpen size={15} className={tab === 'collections' ? 'text-primary-foreground' : 'text-muted-foreground'} />
          <span>Collections</span>
          <span className="tabular font-semibold opacity-85">({collections.length})</span>
        </Button>

        <Button
          variant="ghost"
          className={`rounded-full gap-2 ${tab === 'drafts' ? 'selected' : ''}`}
          onClick={() => {
            setTab('drafts');
            setSelectedCollectionId('');
          }}
        >
          <FileText size={15} className={tab === 'drafts' ? 'text-primary-foreground' : 'text-muted-foreground'} />
          <span>Drafts</span>
          <span className="tabular font-semibold opacity-85">({draftCount})</span>
        </Button>
      </div>

      {/* Collections Shelf View */}
      {tab === 'collections' && (
        <div className="mb-8">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CURATED SHELVES</span>
              <h2>{activeCollection ? activeCollection.name : 'Your Collections'}</h2>
            </div>
            <Button
              variant="outline"
              className="rounded-full gap-1.5 text-xs"
              onClick={() => setModalOpen(true)}
            >
              <FolderPlus size={15} /> New Collection
            </Button>
          </div>

          <div className="collection-grid">
            {collections.map((c, index) => {
              const isSelected = selectedCollectionId === c.id;
              return (
                <div
                  key={c.id}
                  className={`collection-item group ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedCollectionId(isSelected ? '' : c.id)}
                >
                  <div className="flex items-start justify-between gap-2.5 mb-2.5 min-w-0">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`collection-symbol collection-${index % 3}`}>
                        <BookOpen size={18} />
                      </span>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <strong className="text-base font-serif font-semibold text-foreground block truncate group-hover:text-primary transition-colors">
                          {c.name}
                        </strong>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {c.description || 'Curated recipes for this shelf.'}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0 rounded-lg transition-colors -mr-1 -mt-0.5"
                      title="Delete collection"
                      onClick={e => {
                        e.stopPropagation();
                        const deletedCol = { ...c };
                        deleteCollection(c.id);
                        if (selectedCollectionId === c.id) setSelectedCollectionId('');
                        toast.info(`Deleted collection "${c.name}"`, {
                          action: {
                            label: 'Undo',
                            onClick: () => {
                              createCollection(deletedCol.name, deletedCol.description);
                            },
                          },
                        });
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/50 text-xs min-w-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary text-secondary-foreground border border-border/60 shrink-0">
                      <Utensils size={11} className="text-primary" />
                      <span className="tabular">{c.ids.length}</span> {c.ids.length === 1 ? 'recipe' : 'recipes'}
                    </span>

                    {isSelected ? (
                      <span className="text-[11px] font-semibold text-primary flex items-center gap-1 shrink-0">
                        <Check size={12} strokeWidth={2.5} /> Active Shelf
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors truncate min-w-0 text-right">
                        Click to filter
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {activeCollection && (
            <div className="flex items-center justify-between p-3.5 mb-6 rounded-xl bg-secondary/60 border border-border">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <BookOpen size={14} className="text-primary" />
                <span>
                  Showing recipes inside shelf: <strong className="text-foreground">{activeCollection.name}</strong>
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 rounded-full text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => setSelectedCollectionId('')}
              >
                Clear shelf filter
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Recipe Grid */}
      <div className="recipe-grid">
        {(tab !== 'collections' || activeCollection) &&
          visibleRecipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
      </div>

      {/* Empty States */}
      {(tab !== 'collections' || activeCollection) && visibleRecipes.length === 0 && (
        <EmptyState
          icon={tab === 'drafts' ? FileText : tab === 'collections' ? BookOpen : Heart}
          title={
            tab === 'drafts'
              ? 'No recipes simmering in drafts'
              : tab === 'collections'
              ? 'This collection shelf is empty'
              : 'Your cookbook shelf is waiting'
          }
          description={
            tab === 'drafts'
              ? 'Start creating a new recipe and choose "Save as Draft" to fine-tune your measurements and technique.'
              : tab === 'collections'
              ? 'You can add recipes to this collection directly from any recipe details card or while editing.'
              : 'You have not saved any recipes yet! Explore our chef curated library and tap the bookmark or heart icon to save your favorites.'
          }
          actionLabel={tab === 'drafts' ? 'Draft a recipe' : 'Discover recipes'}
          actionTo={tab === 'drafts' ? '/create' : '/'}
        />
      )}

      {/* Create Collection Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Create a New Collection</DialogTitle>
          <DialogDescription>
            Group recipes by season, celebration, or favorite memories.
          </DialogDescription>
          <form onSubmit={handleCreateCollection} className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Collection Name *</label>
              <Input
                required
                maxLength={60}
                placeholder="e.g. Grandma’s Sunday Dinners"
                value={collectionName}
                onChange={e => setCollectionName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Description (Optional)</label>
              <Textarea
                placeholder="A few words about what brings these recipes together…"
                value={collectionDesc}
                onChange={e => setCollectionDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full bg-primary text-primary-foreground shadow-xs">
                Create Collection
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}