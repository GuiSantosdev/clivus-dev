
'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CtaButtonProps {
  text?: string
  subtext?: string
  href?: string
  variant?: 'primary' | 'secondary'
  showIcon?: boolean
  className?: string
}

export function CtaButton({ 
  text = "QUERO COMEÇAR AGORA",
  subtext = "Acesso imediato após o pagamento",
  href = "#oferta",
  variant = 'primary',
  showIcon = true,
  className = ""
}: CtaButtonProps) {
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <motion.div 
      className={`flex flex-col items-center gap-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Button
        onClick={handleClick}
        size="lg"
        className={`
          group relative overflow-hidden px-8 py-6 text-lg font-bold
          ${variant === 'primary' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
          }
          shadow-lg hover:shadow-xl transition-all duration-300
        `}
      >
        <span className="relative z-10 flex items-center gap-2">
          {showIcon && <Sparkles className="w-5 h-5" />}
          {text}
          {showIcon && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
        </span>
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </Button>
      
      {subtext && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          {subtext}
        </p>
      )}
    </motion.div>
  )
}
