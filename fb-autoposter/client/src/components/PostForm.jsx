import { useState, useEffect } from 'react';
import { posts } from '../api';

export default function PostForm({ campaignId, post, onSaved, onCancel }) {
  const [name, setName] = useState(post?.name || '');
  const [content, setContent] = useState(post?.content || '');
  const [price, setPrice] = useState(post?.price || '');
  const [location, setLocation] = useState(post?.location || '');
  const [bedrooms, setBedrooms] = useState(post?.bedrooms || '');
  const [bathrooms, setBathrooms] = useState(post?.bathrooms || '');
  const [existingImages, setExistingImages] = useState(post?.images || []);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p));
  }, [previews]);

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  }

  function removeExisting(img) {
    setExistingImages((prev) => prev.filter((i) => i !== img));
  }

  function removeNew(index) {
    URL.revokeObjectURL(previews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('campaign_id', campaignId);
      formData.append('name', name.trim());
      formData.append('content', content.trim());
      if (price.trim())     formData.append('price', price.trim());
      if (location.trim())  formData.append('location', location.trim());
      if (bedrooms.trim())  formData.append('bedrooms', bedrooms.trim());
      if (bathrooms.trim()) formData.append('bathrooms', bathrooms.trim());
      newFiles.forEach((f) => formData.append('images', f));
      if (post) {
        formData.append('keep_images', JSON.stringify(existingImages));
        await posts.update(post.id, formData);
      } else {
        await posts.create(formData);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full border border-brand-200 rounded-xl px-4 py-2.5 text-sm text-brand-800 placeholder-brand-300 bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all';
  const labelCls = 'block text-sm font-medium text-brand-700 mb-1.5';

  return (
    <div className="bg-white rounded-2xl border border-brand-200 shadow-sm p-6 mb-4">
      <h3 className="text-base font-semibold text-brand-800 mb-5">
        {post ? 'עריכת פוסט' : 'פוסט חדש'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className={labelCls}>שם הפוסט</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="שם תיאורי לפוסט"
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className={labelCls}>תוכן הפוסט</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="כתוב כאן את תוכן הפוסט..."
            rows={5}
            className={`${inputCls} resize-none`}
            required
          />
        </div>

        {/* Marketplace fields */}
        <div className="border border-brand-100 bg-brand-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-brand-600">
            שדות קנייה ומכירה
            <span className="font-normal text-brand-300 mr-1">(נדרש לקבוצות "מכור משהו")</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'מחיר לחודש (₪)', value: price, onChange: setPrice, placeholder: 'לדוגמה: 4500' },
              { label: 'כתובת הנכס',      value: location, onChange: setLocation, placeholder: 'לדוגמה: ראשון לציון' },
              { label: 'חדרי שינה',       value: bedrooms, onChange: setBedrooms, placeholder: 'לדוגמה: 3' },
              { label: 'חדרי אמבטיה',    value: bathrooms, onChange: setBathrooms, placeholder: 'לדוגמה: 1' },
            ].map(({ label, value, onChange, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-brand-500 mb-1">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm bg-white text-brand-800 placeholder-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className={labelCls}>תמונות / סרטונים</label>

          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {existingImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={`/uploads/${img}`} alt=""
                    className="w-20 h-20 object-cover rounded-xl border border-brand-100" />
                  <button type="button" onClick={() => removeExisting(img)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {previews.map((preview, i) => (
                <div key={i} className="relative group">
                  <img src={preview} alt=""
                    className="w-20 h-20 object-cover rounded-xl border border-brand-500" />
                  <button type="button" onClick={() => removeNew(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="cursor-pointer inline-flex items-center gap-2 border border-dashed border-brand-200 rounded-xl px-4 py-2.5 text-sm text-brand-400 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            הוסף תמונה / סרטון
            <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !name.trim() || !content.trim()}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
          >
            {saving ? 'שומר...' : post ? 'שמור שינויים' : 'צור פוסט'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="border border-brand-200 text-brand-500 hover:bg-brand-50 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
