import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, BookOpen, Heart, FileText, Trash2, ArrowUpRight, FolderPlus } from 'lucide-react';
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

  const activeCollection = collections.find(c => c.id === selectedCollectionId);

  // Filter recipes depending on active tab
  const visibleRecipes = items.filter(r => {
    if (tab === 'drafts') return r.status === 'Draft';
    if (tab === 'collections') {
      return activeCollection ? activeCollection.ids.includes(r.id) : false;
    }
    // Saved tab
    return saved.includes(r.id);
  });

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
          <Button asChild className="rounded-full bg-clay text-white gap-2 shadow-sm">
            <Link to="/create">
              <Plus size={16} /> Add a recipe
            </Link>
          </Button>
        }
      />

      {/* Tabs */}
      <div className="content-tabs">
        <Button
          variant="ghost"
          className={`rounded-full gap-2 ${tab === 'saved' ? 'selected' : ''}`}
          onClick={() => {
            setTab('saved');
            setSelectedCollectionId('');
          }}
        >
          <Heart size={16} className={tab === 'saved' ? 'fill-clay text-clay' : ''} />
          Saved recipes <span className="tabular font-semibold">({saved.length})</span>
        </Button>

        <Button
          variant="ghost"
          className={`rounded-full gap-2 ${tab === 'collections' ? 'selected' : ''}`}
          onClick={() => setTab('collections')}
        >
          <BookOpen size={16} />
          Collections <span className="tabular font-semibold">({collections.length})</span>
        </Button>

        <Button
          variant="ghost"
          className={`rounded-full gap-2 ${tab === 'drafts' ? 'selected' : ''}`}
          onClick={() => {
            setTab('drafts');
            setSelectedCollectionId('');
          }}
        >
          <FileText size={16} />
          Drafts <span className="tabular font-semibold">({items.filter(r => r.status === 'Draft').length})</span>
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
                  className={`collection-item rounded-2xl border transition-all cursor-pointer p-5 flex items-start gap-4 ${
                    isSelected
                      ? 'border-clay bg-card shadow-md ring-1 ring-clay'
                      : 'border-border bg-card hover:border-clay/50'
                  }`}
                  onClick={() => setSelectedCollectionId(isSelected ? '' : c.id)}
                >
                  <span className={`collection-symbol collection-${index % 2} rounded-xl`}>
                    <BookOpen size={22} />
                  </span>

                  <div className="flex-1">
                    <strong className="text-base font-serif block">{c.name}</strong>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {c.description}
                    </p>
                    <span className="text-[11px] font-semibold text-clay mt-2 inline-block">
                      {c.ids.length} {c.ids.length === 1 ? 'recipe' : 'recipes'}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                    title="Delete collection"
                    onClick={e => {
                      e.stopPropagation();
                      deleteCollection(c.id);
                      if (selectedCollectionId === c.id) setSelectedCollectionId('');
                      toast.info(`Deleted collection "${c.name}"`);
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              );
            })}
          </div>

          {activeCollection && (
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <span className="text-xs text-muted-foreground">
                Showing recipes inside: <strong>{activeCollection.name}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setSelectedCollectionId('')}
              >
                Clear collection filter
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
              <Button type="submit" className="rounded-full bg-clay text-white">
                Create Collection
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}