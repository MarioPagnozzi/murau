UPDATE produtos SET nome = (CASE SUBSTRING_INDEX(nome, ' ',-1) WHEN 'M' THEN			 
				SUBSTRING(nome,1,LENGTH(nome) - LENGTH(SUBSTRING_INDEX(nome, ' ',-1)))
			ELSE
				CASE SUBSTRING_INDEX(nome, ' ', -1) WHEN 'MM' THEN
					SUBSTRING(nome,1,LENGTH(nome) - LENGTH(SUBSTRING_INDEX(nome, ' ',-1)))
				ELSE 
					CASE SUBSTRING_INDEX(nome, ' ', -1) WHEN 'P' THEN
						SUBSTRING(nome,1,LENGTH(nome) - LENGTH(SUBSTRING_INDEX(nome, ' ',-1)))
					ELSE
						CASE SUBSTRING_INDEX(nome, ' ', -1) WHEN 'PP' THEN
							SUBSTRING(nome,1,LENGTH(nome) - LENGTH(SUBSTRING_INDEX(nome, ' ',-1)))
						ELSE 
							CASE SUBSTRING_INDEX(nome, ' ', -1) WHEN 'G' THEN
									SUBSTRING(nome,1,LENGTH(nome) - LENGTH(SUBSTRING_INDEX(nome, ' ',-1)))
							ELSE 
								CASE SUBSTRING_INDEX(nome, ' ', -1) WHEN 'GG' THEN
									SUBSTRING(nome,1,LENGTH(nome) - LENGTH(SUBSTRING_INDEX(nome, ' ',-1)))
								ELSE 
									nome
								END
							END
						END
					END
				END
			END)