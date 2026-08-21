const fs = require('fs');

const pages = [
  { path: 'src/app/(admin)/schools/page.tsx', name: 'school' },
  { path: 'src/app/(admin)/departments/page.tsx', name: 'department' }
];

pages.forEach(({ path, name }) => {
  let content = fs.readFileSync(path, 'utf8');

  // Replace handleDelete logic
  const handleRegex = /const handleDelete = async \(id: string\) => \{[\s\S]*?\}, \{ duration: 5000 \}\);\s*\};/;
  
  const newHandleLogic = 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await fetch(\/api/s/\\, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success(' deleted successfully');
      fetchData();
    } catch (e) {
      toast.error('Could not delete ');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };;

  // Fix fetchData/fetchSchools naming differences
  if (name === 'school') {
    content = content.replace(/fetchSchools\(\);/g, 'fetchData();');
    content = content.replace(/const fetchSchools =/g, 'const fetchData =');
  }

  content = content.replace(handleRegex, newHandleLogic);

  // Replace onClick handler
  const onClickRegex = /onClick=\{\(\) => handleDelete\((\w+)\.id\)\}/g;
  content = content.replace(onClickRegex, 'onClick={() => confirmDelete(.id)}');

  // Append Modal
  const modal = 
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-danger-light text-danger rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Confirm Deletion</h3>
              <p className="text-sm text-muted">
                Are you sure you want to delete this ? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-background border-t border-border flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeletingId(null); }}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground bg-surface-hover hover:bg-border-light rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-red-600 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
;

  content = content.replace(/\s*<\/div>\s*\);\s*}\s*$/, modal);

  fs.writeFileSync(path, content, 'utf8');
});