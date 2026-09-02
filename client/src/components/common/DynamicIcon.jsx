import React from 'react';
import * as Icons from 'lucide-react';

// Common mapping fallback
const iconMap = {
  Apple: Icons.Apple,
  Milk: Icons.Milk,
  Beef: Icons.Beef,
  Wheat: Icons.Wheat,
  Coffee: Icons.Coffee,
  Package: Icons.Package,
  Salad: Icons.Salad,
  Egg: Icons.Egg,
  Fish: Icons.Fish,
  Droplet: Icons.Droplet,
  Layers: Icons.Layers,
  Pizza: Icons.Pizza,
  Utensils: Icons.Utensils,
  CupSoda: Icons.CupSoda,
  Cookie: Icons.Cookie,
  Citrus: Icons.Citrus,
  Sparkles: Icons.Sparkles,
  Folder: Icons.Folder,
  Tag: Icons.Tag,
  AlertTriangle: Icons.AlertTriangle,
  AlertCircle: Icons.AlertCircle,
  CheckCircle2: Icons.CheckCircle2,
  Box: Icons.Box,
  Flame: Icons.Flame,
  Refrigerator: Icons.Refrigerator
};

export default function DynamicIcon({ name, className = 'w-5 h-5', ...props }) {
  if (!name) {
    return <Icons.Package className={className} {...props} />;
  }

  // Check mapped dictionary
  if (iconMap[name]) {
    const Component = iconMap[name];
    return <Component className={className} {...props} />;
  }

  // Check direct Lucide icon export
  if (Icons[name]) {
    const Component = Icons[name];
    return <Component className={className} {...props} />;
  }

  // Default fallback
  return <Icons.Package className={className} {...props} />;
}
